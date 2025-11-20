package com.lastnyam.customer.foocketing.repository;

import com.lastnyam.common.dto.CursorResponse;
import com.lastnyam.customer.foocketing.dto.FoocketingBriefInfo;
import com.lastnyam.customer.foocketing.dto.TimestampCursorInfo;
import com.lastnyam.customer.foocketing.enums.FoocketingSortType;
import com.lastnyam.customer.foocketing.exception.FoocketingCursorException;
import com.lastnyam.customer.global.dto.MenuInfo;
import com.lastnyam.customer.global.dto.ShopInfo;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FoocketingQueryRepository {

    private static final Integer NEARBY_COUNT = 8;
    private static final Integer SEARCH_COUNT = 20;
    private final JdbcTemplate jdbcTemplate;

    public CursorResponse<FoocketingBriefInfo> findFoocketingsNear(FoocketingSortType sort, Double lat, Double lng,
                                                                   Integer categoryId,
                                                                   String cursor) {
        QueryBuilder queryBuilder = new QueryBuilder();

        queryBuilder.buildBaseQuery(lat, lng);
        queryBuilder.addCategoryCondition(categoryId);
        if (cursor != null) {
            queryBuilder.buildCursorQuery(parseCursor(cursor));
        }

        queryBuilder.addSortCondition(sort);
        queryBuilder.addLimitCondition(NEARBY_COUNT);

        List<FoocketingBriefInfo> result = getQueryResult(queryBuilder);

        return processResult(result, NEARBY_COUNT);
    }

    public CursorResponse<FoocketingBriefInfo> searchFoocketingsByKeyword(FoocketingSortType sort, String keyword,
                                                                          Double lat, Double lng, String cursor) {
        QueryBuilder queryBuilder = new QueryBuilder();

        queryBuilder.buildBaseQuery(lat, lng);

        queryBuilder.buildSearchQuery(keyword);

        if (cursor != null) {
            queryBuilder.buildCursorQuery(parseCursor(cursor));
        }

        queryBuilder.addSortCondition(sort);
        queryBuilder.addLimitCondition(SEARCH_COUNT);

        List<FoocketingBriefInfo> result = getQueryResult(queryBuilder);

        return processResult(result, SEARCH_COUNT);
    }

    private CursorResponse<FoocketingBriefInfo> processResult(List<FoocketingBriefInfo> result, Integer count) {
        String nextCursor = null;
        boolean hasNext = false;

        if (result.size() > count) {
            hasNext = true;
            FoocketingBriefInfo last = result.getLast();
            nextCursor = createCursor(last.getOpenTime(), last.getFoocketingId());
        }

        return CursorResponse.<FoocketingBriefInfo>builder()
                .hasNextPage(hasNext)
                .nextCursor(nextCursor)
                .content(result)
                .build();
    }

    private List<FoocketingBriefInfo> getQueryResult(QueryBuilder queryBuilder) {
        return jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToFoocketingBriefInfo,
                queryBuilder.getParams().toArray()
        );
    }

    private FoocketingBriefInfo mapToFoocketingBriefInfo(ResultSet rs, int rowNum) throws SQLException {
        int id = rs.getInt("foocketing_id");
        LocalDateTime foocketingTime = rs.getTimestamp("foocketing_time").toLocalDateTime();
        String menuName = rs.getString("menu_name");
        int menuPrice = rs.getInt("menu_price");
        String menuImage = rs.getString("menu_image");

        String shopName = rs.getString("shop_name");
        double shopLat = rs.getDouble("shop_lat");
        double shopLng = rs.getDouble("shop_lng");

        // ST_Distance는 미터 단위로 반환되므로 Km로 변환 (소숫점 첫째자리)
        double distanceM = rs.getDouble("distance");
        double distanceKm = Math.round((distanceM / 1000.0) * 10.0) / 10.0;

        int shopId = rs.getInt("shop_id");
        int shopRatingCount = rs.getInt("shop_rating_count");
        double shopRating = rs.getDouble("shop_rating_avg");

        MenuInfo menuInfo = MenuInfo.builder()
                .name(menuName)
                .price(menuPrice)
                .photoUrl(menuImage)
                .build();

        ShopInfo shopInfo = ShopInfo.builder()
                .shopId(shopId)
                .name(shopName)
                .lat(shopLat)
                .lng(shopLng)
                .distance(distanceKm)
                .rating(shopRating)
                .ratingCount(shopRatingCount)
                .build();

        return FoocketingBriefInfo.builder()
                .foocketingId(id)
                .openTime(foocketingTime)
                .menu(menuInfo)
                .shop(shopInfo)
                .build();
    }

    private String createCursor(LocalDateTime createdAt, Integer id) {
        String cursorData = createdAt + "_" + id;
        return Base64.getEncoder().encodeToString(cursorData.getBytes(StandardCharsets.UTF_8));
    }

    private TimestampCursorInfo parseCursor(String cursor) {
        String decoded = new String(Base64.getDecoder().decode(cursor));

        String[] parts = decoded.split("_");

        if (parts.length < 2) {
            throw new FoocketingCursorException();
        }

        LocalDateTime timestamp = LocalDateTime.parse(parts[0]);
        Integer foocketingId = Integer.parseInt(parts[1]);

        return new TimestampCursorInfo(timestamp, foocketingId);

    }


    private static class QueryBuilder {
        private final StringBuilder sql = new StringBuilder();

        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Double lat, Double lon) {
            sql.append("""
                    SELECT f.foocketing_id,f.foocketing_time,m.menu_name,m.menu_price,m.menu_image,
                            s.shop_id, s.shop_name, s.shop_lat, s.shop_lng, 
                            ST_Distance(
                               ST_Point(?, ?)::geography,
                               ST_Point(s.shop_lng, s.shop_lat)::geography                       
                            ) as distance,
                            COALESCE(sr.shop_rating_avg, 0) as shop_rating_avg, 
                            COALESCE(sr.shop_rating_count, 0) as shop_rating_count
                    FROM foocketings f
                    INNER JOIN menus m ON f.menu_id = m.menu_id
                    INNER JOIN shops s ON m.shop_id = s.shop_id
                    LEFT JOIN shop_ratings sr ON s.shop_id = sr.shop_id
                    WHERE
                     ST_DWithin(
                        ST_Point(s.shop_lng, s.shop_lat)::geography,
                        ST_Point(?,?)::geography,
                        1000
                     )
                     AND f.foocketing_close_time > ?                     
                    """);

            params.add(lon);
            params.add(lat);
            params.add(lon);
            params.add(lat);

            LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
            params.add(now);
        }

        public String getSql() {
            return sql.toString();
        }

        public void buildCursorQuery(TimestampCursorInfo cursor) {
            sql.append(" AND (f.foocketing_time > ? OR (f.foocketing_time = ? AND f.foocketing_id > ?))");
            params.add(cursor.getTime());
            params.add(cursor.getTime());
            params.add(cursor.getId());
        }

        public void addCategoryCondition(Integer categoryId) {
            if (categoryId != null) {
                sql.append(" AND m.category_id = ?");
                params.add(categoryId);
            }
        }

        public void addSortCondition(FoocketingSortType type) {

            sql.append(" ORDER BY");
            switch (type) {
                case CLOSEST -> sql.append(" distance ASC");
                case PRICE -> sql.append(" m.menu_price DESC");
                default -> sql.append(" f.foocketing_time ASC");
            }
        }

        public void addLimitCondition(Integer count) {
            sql.append(" LIMIT ?");
            params.add(count + 1);
        }

        public void buildSearchQuery(String keyword) {
            sql.append(" AND m.menu_name like ?");
            params.add("%" + keyword + "%");
        }
    }
}
