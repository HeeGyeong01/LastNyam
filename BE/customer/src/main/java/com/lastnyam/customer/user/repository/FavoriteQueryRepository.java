package com.lastnyam.customer.user.repository;

import com.lastnyam.customer.user.dto.CursorResponse;
import com.lastnyam.customer.user.dto.FavoriteShopInfo;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FavoriteQueryRepository {

    private static final Integer SHOP_COUNT = 8;
    private final JdbcTemplate jdbcTemplate;

    public CursorResponse<FavoriteShopInfo> findFavoriteShop(Integer userId, Double lat, Double lng,
                                                             String cursor) {
        QueryBuilder queryBuilder = new QueryBuilder();

        queryBuilder.buildBaseQuery(userId, lat, lng);
        if (cursor != null) {
            queryBuilder.buildCursorQuery(parseCursor(cursor));
        }

        queryBuilder.addLimitCondition(SHOP_COUNT);

        List<ShopWithDistance> result = getQueryResult(queryBuilder);

        return processResult(result, SHOP_COUNT);
    }

    private CursorResponse<FavoriteShopInfo> processResult(List<ShopWithDistance> result, Integer count) {
        String nextCursor = null;
        boolean hasNext = false;

        if (result.size() > count) {
            hasNext = true;
            ShopWithDistance last = result.getLast();
            nextCursor = createCursor(last.getDistance(), last.getShopInfo().getShopId());
        }

        // count + 1개를 조회했으므로 마지막 항목 제거
        List<FavoriteShopInfo> shopList = result.stream()
                .limit(count)
                .map(ShopWithDistance::getShopInfo)
                .toList();

        return CursorResponse.<FavoriteShopInfo>builder()
                .hasNextPage(hasNext)
                .nextCursor(nextCursor)
                .content(shopList)
                .build();
    }

    private List<ShopWithDistance> getQueryResult(QueryBuilder queryBuilder) {
        return jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToShopWithDistance,
                queryBuilder.getParams().toArray());
    }

    private ShopWithDistance mapToShopWithDistance(ResultSet rs, int rowNum) throws SQLException {
        Double distance = rs.getDouble("distance");

        FavoriteShopInfo shopInfo = mapToFavoriteShopInfo(rs, rowNum);

        return new ShopWithDistance(shopInfo, distance);
    }

    private FavoriteShopInfo mapToFavoriteShopInfo(ResultSet rs, int rowNum) throws SQLException {
        Integer shopId = rs.getInt("shop_id");
        String name = rs.getString("shop_name");
        Double lat = rs.getDouble("shop_lat");
        Double lng = rs.getDouble("shop_lng");
        String bannerUrl = rs.getString("shop_banner");
        Double distance = rs.getDouble("distance");
        Double rating = rs.getDouble("rating");
        Integer ratingCount = rs.getInt("rating_count");

        // PostgreSQL array를 Java List로 변환
        java.sql.Array sqlArray = rs.getArray("on_sale_menus");
        List<String> onSaleMenus = new ArrayList<>();
        if (sqlArray != null) {
            String[] array = (String[]) sqlArray.getArray();
            onSaleMenus = Arrays.asList(array);
        }

        return FavoriteShopInfo.builder()
                .shopId(shopId)
                .name(name)
                .lat(lat)
                .lng(lng)
                .distance(distance)
                .rating(rating)
                .ratingCount(ratingCount)
                .onSaleMenus(onSaleMenus)
                .bannerUrl(bannerUrl)
                .build();
    }

    private String createCursor(Double distance, Integer shopId) {
        String cursorData = distance + "_" + shopId;
        return Base64.getEncoder().encodeToString(cursorData.getBytes(StandardCharsets.UTF_8));
    }

    private DistanceCursorInfo parseCursor(String cursor) {
        String decoded = new String(Base64.getDecoder().decode(cursor));

        String[] parts = decoded.split("_");
        if (parts.length < 2) {
            throw new FavoriteQueryException("Invalid cursor format");
        }

        try {
            Double distance = Double.parseDouble(parts[0]);
            Integer shopId = Integer.parseInt(parts[1]);
            return new DistanceCursorInfo(distance, shopId);
        } catch (NumberFormatException e) {
            throw new FavoriteQueryException("Invalid cursor format");
        }
    }

    private static class QueryBuilder {
        private final StringBuilder sql = new StringBuilder();

        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Integer userId, Double lat, Double lng) {
            sql.append("""
                    SELECT
                        f.favorite_id,
                        s.shop_id,
                        s.shop_name,
                        s.shop_lat,
                        s.shop_lng,
                        s.shop_banner,
                        ST_Distance(
                            ST_Point(?, ?)::geography,
                            ST_Point(s.shop_lng, s.shop_lat)::geography
                        ) / 1000.0 as distance,
                        COALESCE(
                            ROUND(CAST(sr.shop_rating_sum AS NUMERIC) / NULLIF(sr.shop_rating_count, 0), 1),
                            0.0
                        ) as rating,
                        COALESCE(sr.shop_rating_count, 0) as rating_count,
                        COALESCE(
                            array_agg(DISTINCT m.menu_name) FILTER (
                                WHERE d.discount_id IS NOT NULL
                                AND d.discount_pickup_end_time > CURRENT_TIMESTAMP
                            ),
                            ARRAY[]::text[]
                        ) as on_sale_menus
                    FROM favorites f
                    INNER JOIN shops s ON f.shop_id = s.shop_id
                    LEFT JOIN shop_ratings sr ON s.shop_id = sr.shop_id
                    LEFT JOIN menus m ON s.shop_id = m.shop_id
                    LEFT JOIN discounts d ON m.menu_id = d.menu_id
                    WHERE f.user_id = ?
                    GROUP BY s.shop_id, s.shop_name, s.shop_lat, s.shop_lng, s.shop_banner,
                             sr.shop_rating_sum, sr.shop_rating_count, f.favorite_id
                    ORDER BY f.favorite_id DESC
                    """);

            params.add(lng);
            params.add(lat);
            params.add(userId);
        }

        public String getSql() {
            return sql.toString();
        }

        public void buildCursorQuery(DistanceCursorInfo cursor) {
            // distance와 shop_id를 모두 고려한 cursor 조건
            // ORDER BY distance ASC, s.shop_id ASC이므로
            // distance > cursor.distance OR (distance = cursor.distance AND shop_id >
            // cursor.shopId)
            sql.insert(sql.indexOf("ORDER BY"), " AND (distance > ? OR (distance = ? AND s.shop_id > ?)) ");
            params.add(cursor.getDistance());
            params.add(cursor.getDistance());
            params.add(cursor.getShopId());
        }

        public void addLimitCondition(Integer count) {
            sql.append(" LIMIT ?");
            params.add(count + 1);
        }
    }

    private static class DistanceCursorInfo {
        @Getter
        private final Double distance;
        @Getter
        private final Integer shopId;

        public DistanceCursorInfo(Double distance, Integer shopId) {
            this.distance = distance;
            this.shopId = shopId;
        }
    }

    private static class ShopWithDistance {
        @Getter
        private final FavoriteShopInfo shopInfo;
        @Getter
        private final Double distance;

        public ShopWithDistance(FavoriteShopInfo shopInfo, Double distance) {
            this.shopInfo = shopInfo;
            this.distance = distance;
        }
    }

    private static class FavoriteQueryException extends RuntimeException {
        public FavoriteQueryException(String message) {
            super(message);
        }
    }
}
