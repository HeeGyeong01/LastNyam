package com.lastnyam.customer.discount.repository;

import com.lastnyam.common.dto.CursorResponse;
import com.lastnyam.customer.discount.dto.DiscountBriefInfo;
import com.lastnyam.customer.discount.dto.DiscountCursorInfo;
import com.lastnyam.customer.discount.enums.DiscountSortType;
import com.lastnyam.customer.discount.exception.DiscountCursorException;
import com.lastnyam.customer.global.dto.MenuInfo;
import com.lastnyam.customer.global.dto.ShopInfo;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class DiscountQueryRepository {

    private static final Integer NEARBY_COUNT = 8;
    private static final Integer SEARCH_COUNT = 20;
    private final JdbcTemplate jdbcTemplate;

    public CursorResponse<DiscountBriefInfo> findDiscountsNear(DiscountSortType sort, Double lat, Double lng,
                                                               Integer categoryId,
                                                               String cursor) {
        QueryBuilder queryBuilder = new QueryBuilder();

        queryBuilder.buildBaseQuery(lat, lng);
        queryBuilder.addCategoryCondition(categoryId);
        if (cursor != null) {
            queryBuilder.buildCursorQuery(parseCursor(cursor), sort, lat, lng);
        }

        queryBuilder.addSortCondition(sort);
        queryBuilder.addLimitCondition(NEARBY_COUNT);

        List<DiscountBriefInfo> result = getQueryResult(queryBuilder);

        return processResult(result, NEARBY_COUNT);
    }

    public CursorResponse<DiscountBriefInfo> searchDiscountsByKeyword(DiscountSortType sort, String keyword,
                                                                      Double lat, Double lng, String cursor) {
        QueryBuilder queryBuilder = new QueryBuilder();

        queryBuilder.buildBaseQuery(lat, lng);

        queryBuilder.buildSearchQuery(keyword);

        if (cursor != null) {
            queryBuilder.buildCursorQuery(parseCursor(cursor), sort, lat, lng);
        }

        queryBuilder.addSortCondition(sort);
        queryBuilder.addLimitCondition(SEARCH_COUNT);

        List<DiscountBriefInfo> result = getQueryResult(queryBuilder);

        return processResult(result, SEARCH_COUNT);
    }

    private CursorResponse<DiscountBriefInfo> processResult(List<DiscountBriefInfo> result, Integer count) {
        String nextCursor = null;
        boolean hasNext = false;

        if (result.size() > count) {
            hasNext = true;
            DiscountBriefInfo last = result.removeLast();
            nextCursor = createCursor(last);
        }

        return CursorResponse.<DiscountBriefInfo>builder()
                .hasNextPage(hasNext)
                .nextCursor(nextCursor)
                .content(result)
                .build();
    }

    private List<DiscountBriefInfo> getQueryResult(QueryBuilder queryBuilder) {
        return jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToDiscountBriefInfo,
                queryBuilder.getParams().toArray()
        );
    }

    private DiscountBriefInfo mapToDiscountBriefInfo(ResultSet rs, int rowNum) throws SQLException {

        String menuImage = rs.getString("menu_image");
        String menuName = rs.getString("menu_name");
        String menuDescription = rs.getString("menu_description");
        Integer menuPrice = rs.getInt("menu_price");

        Integer shopId = rs.getInt("shop_id");
        String shopName = rs.getString("shop_name");
        String shopBanner = rs.getString("shop_banner");
        double shopLat = rs.getDouble("shop_lat");
        double shopLng = rs.getDouble("shop_lng");

        // ST_Distance는 미터 단위로 반환되므로 Km로 변환 (소숫점 첫째자리)
        double distanceM = rs.getDouble("distance");
        double distanceKm = Math.round((distanceM / 1000.0) * 10.0) / 10.0;

        double shopRating = rs.getDouble("shop_rating_avg");
        int shopRatingCount = rs.getInt("shop_rating_count");

        int discountId = rs.getInt("discount_id");
        int discountRate = rs.getInt("discount_rate");
        int discountPrice = rs.getInt("discount_price");
        int discountAmount = rs.getInt("discount_menu_amount");

        MenuInfo menuInfo = MenuInfo.builder()
                .price(menuPrice)
                .name(menuName)
                .description(menuDescription)
                .photoUrl(menuImage)
                .build();

        ShopInfo shopInfo = ShopInfo.builder()
                .shopId(shopId)
                .name(shopName)
                .bannerUrl(shopBanner)
                .lat(shopLat)
                .lng(shopLng)
                .distance(distanceKm)
                .rating(shopRating)
                .ratingCount(shopRatingCount)
                .build();

        return DiscountBriefInfo.builder()
                .discountId(discountId)
                .discountPrice(discountPrice)
                .discountAmount(discountAmount)
                .discountRate(discountRate)
                .menuInfo(menuInfo)
                .shopInfo(shopInfo)
                .build();
    }

    private String createCursor(DiscountBriefInfo info) {
        String cursorData = info.getDiscountId() + "," + info.getShopInfo().getDistance() + "," + info.getShopInfo()
                .getRating() + "," + info.getDiscountPrice() + "," + info.getDiscountRate();
        return Base64.getEncoder().encodeToString(cursorData.getBytes(StandardCharsets.UTF_8));
    }

    private DiscountCursorInfo parseCursor(String cursor) {
        String decoded = new String(Base64.getDecoder().decode(cursor));
        String[] splitted = decoded.split(",");

        if (splitted.length != 5) {
            throw new DiscountCursorException();
        }

        Integer id = Integer.parseInt(splitted[0]);
        Double distance = Double.parseDouble(splitted[1]);
        Double rating = Double.parseDouble(splitted[2]);
        Integer price = Integer.parseInt(splitted[3]);
        Integer discountRate = Integer.parseInt(splitted[4]);

        return new DiscountCursorInfo(id, distance, rating, price, discountRate);
    }


    private static class QueryBuilder {
        private final StringBuilder sql = new StringBuilder();

        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Double lat, Double lon) {
            sql.append("""
                    SELECT s.shop_id, s.shop_name, s.shop_lat, s.shop_lng,s.shop_banner,
                            ROUND(ST_Distance(
                               ST_Point(?, ?)::geography,
                               ST_Point(s.shop_lng, s.shop_lat)::geography
                            )::numeric,0) as distance,
                            COALESCE(sr.shop_rating_avg, 0) as shop_rating_avg,
                            COALESCE(sr.shop_rating_count, 0) as shop_rating_count,
                            m.menu_name, m.menu_description, m.menu_price, m.menu_image,
                            d.discount_id, d.discount_menu_amount, d.discount_rate, d.discount_price
                    FROM discounts d
                    INNER JOIN menus m ON d.menu_id = m.menu_id
                    INNER JOIN shops s ON m.shop_id = s.shop_id
                    LEFT JOIN shop_ratings sr ON s.shop_id = sr.shop_id
                    WHERE
                     ST_DWithin(
                        ST_Point(s.shop_lng, s.shop_lat)::geography,
                        ST_Point(?, ?)::geography,
                        3000
                     )
                     AND d.discount_close_time > NOW()
                    """);
            params.add(lon);
            params.add(lat);
            params.add(lon);
            params.add(lat);
        }

        public String getSql() {
            return sql.toString();
        }

        public void buildCursorQuery(DiscountCursorInfo cursor, DiscountSortType type, Double lat, Double lng) {
            sql.append(" AND (");

            switch (type) {
                case RATING -> {
                    sql.append("shop_rating_avg < ? OR (shop_rating_avg = ? AND discount_id < ?)");
                    params.add(cursor.getRating());
                    params.add(cursor.getRating());
                }
                case PRICE -> {
                    sql.append("discount_price > ? OR (discount_price = ? AND discount_id < ?)");
                    params.add(cursor.getPrice());
                    params.add(cursor.getPrice());
                }
                case DISCOUNT -> {
                    sql.append("discount_rate < ? OR (discount_rate = ? AND discount_id < ?)");
                    params.add(cursor.getDiscountRate());
                    params.add(cursor.getDiscountRate());
                }
                case CLOSEST -> {
                    sql.append("""
                            ROUND(ST_Distance(
                                   ST_Point(?, ?)::geography,
                                   ST_Point(s.shop_lng, s.shop_lat)::geography
                                )/1000::numeric,3) > ?
                                OR (
                                   ROUND(ST_Distance(
                                      ST_Point(?, ?)::geography,
                                      ST_Point(s.shop_lng, s.shop_lat)::geography
                                   )/1000::numeric,3) = ?
                                   AND discount_id < ?
                                )
                            """);
                    params.add(lng);
                    params.add(lat);
                    params.add(cursor.getDistance());
                    params.add(lng);
                    params.add(lat);
                    params.add(cursor.getDistance());
                }
                default -> {
                    sql.append("discount_id < ?");
                }
            }

            params.add(cursor.getId());
            sql.append(")");
        }

        public void addCategoryCondition(Integer categoryId) {
            if (categoryId != null) {
                sql.append(" AND m.category_id = ?");
                params.add(categoryId);
            }
        }

        public void addSortCondition(DiscountSortType type) {
            sql.append(" ORDER BY");
            switch (type) {
                case RATING -> sql.append(" sr.shop_rating_avg DESC");
                case CLOSEST -> sql.append(" distance ASC");
                case PRICE -> sql.append(" d.discount_price ASC");
                case DISCOUNT -> sql.append(" d.discount_rate DESC");
                default -> sql.append(" sr.shop_favorite_count DESC");
            }
            sql.append(" ,discount_id DESC");
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
