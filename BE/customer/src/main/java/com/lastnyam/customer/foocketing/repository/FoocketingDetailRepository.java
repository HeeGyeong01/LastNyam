package com.lastnyam.customer.foocketing.repository;


import com.lastnyam.customer.foocketing.dto.DetailedMenuInfo;
import com.lastnyam.customer.foocketing.dto.FoocketingDetail;
import com.lastnyam.customer.global.dto.ShopInfo;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FoocketingDetailRepository {

    private final JdbcTemplate jdbcTemplate;

    public FoocketingDetail getDetailOf(Double lng, Double lat, Integer foocketingId) {
        QueryBuilder queryBuilder = new QueryBuilder();

        queryBuilder.buildBaseQuery(lng, lat, foocketingId);

        return getQueryResult(queryBuilder);
    }

    private FoocketingDetail getQueryResult(QueryBuilder queryBuilder) {
        return jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToFoocketingDetail,
                queryBuilder.getParams().toArray()
        ).getFirst();
    }

    private FoocketingDetail mapToFoocketingDetail(ResultSet rs, int rowNum) throws SQLException {
        int id = rs.getInt("foocketing_id");
        int maxAvailable = rs.getInt("foocketing_amount");
        LocalDateTime foocketingTime = rs.getTimestamp("foocketing_time").toLocalDateTime();
        String menuName = rs.getString("menu_name");
        int menuPrice = rs.getInt("menu_price");

        String menuImage = rs.getString("menu_image");
        String menuDescription = rs.getString("menu_description");

        String shopName = rs.getString("shop_name");
        String shopBanner = rs.getString("shop_banner");
        double shopLat = rs.getDouble("shop_lat");
        double shopLng = rs.getDouble("shop_lng");

        // ST_Distance는 미터 단위로 반환되므로 Km로 변환 (소숫점 첫째자리)
        double distanceM = rs.getDouble("distance");
        double distanceKm = Math.round((distanceM / 1000.0) * 10.0) / 10.0;

        int shopId = rs.getInt("shop_id");
        int shopRatingSum = rs.getInt("shop_rating_sum");
        int shopRatingCount = rs.getInt("shop_rating_count");

        double shopRating = Math.round(((double) shopRatingSum / shopRatingCount) * 10.0) / 10.0;

        DetailedMenuInfo menuInfo = DetailedMenuInfo.builder()
                .name(menuName)
                .price(menuPrice)
                .photoUrl(menuImage)
                .menuDescription(menuDescription)
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

        return FoocketingDetail.builder()
                .foocketingId(id)
                .maxAvailable(maxAvailable)
                .openTime(foocketingTime)
                .menu(menuInfo)
                .shop(shopInfo)
                .build();
    }

    private static class QueryBuilder {
        private final StringBuilder sql = new StringBuilder();

        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Double lng, Double lat, Integer targetId) {
            sql.append("""
                    SELECT f.foocketing_id, f.foocketing_amount,
                            f.foocketing_time,m.menu_name,m.menu_price,m.menu_image,m.menu_description,
                            s.shop_id, s.shop_name, s.shop_lat, s.shop_lng, s.shop_banner,
                            ST_Distance(
                               ST_Point(?, ?)::geography,
                               ST_Point(s.shop_lng, s.shop_lat)::geography
                            ) as distance,
                            COALESCE(sr.shop_rating_sum, 0) as shop_rating_sum,
                            COALESCE(sr.shop_rating_count, 0) as shop_rating_count
                    FROM foocketings f
                    JOIN menus m ON f.menu_id = m.menu_id
                    JOIN shops s ON m.shop_id = s.shop_id
                    LEFT JOIN shop_ratings sr ON sr.shop_id = s.shop_id
                    WHERE f.foocketing_id = ?
                    LIMIT 1
                    """);
            params.add(lng);
            params.add(lat);
            params.add(targetId);
        }

        public String getSql() {
            return sql.toString();
        }

    }
}