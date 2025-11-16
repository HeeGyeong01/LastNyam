package com.lastnyam.customer.foocketing.repository;

import com.lastnyam.customer.foocketing.dto.FoocketingBriefInfo;
import com.lastnyam.customer.foocketing.dto.FoocketingFailInfo;
import com.lastnyam.customer.global.dto.MenuInfo;
import com.lastnyam.customer.global.dto.ShopInfo;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FoocketingFailRepository {

    private static final String FOOCKETINGS_OF_SHOP_QUERY = """
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
                    WHERE s.shop_id = ? AND f.foocketing_close_time > ? AND f.foocketing_id <> ?
                    ORDER BY f.foocketing_time ASC
                    LIMIT 6;
            """;

    private static final String FOOCKETINGS_OF_CATEGORY = """
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
                    WHERE m.category_id = ? AND f.foocketing_close_time > ? AND f.foocketing_id <> ?
                    ORDER BY f.foocketing_time ASC
                    LIMIT 6;
            """;
    private final JdbcTemplate jdbcTemplate;

    public FoocketingFailInfo getFailResult(Integer foocketingId, Integer shopId, Integer categoryId, Double lat,
                                            Double lng) {
        List<FoocketingBriefInfo> foocketingsOfShop = jdbcTemplate.query(
                FOOCKETINGS_OF_SHOP_QUERY,
                this::mapToFoocketingBriefInfo,
                lng, lat, shopId, LocalDateTime.now(), foocketingId
        );

        List<FoocketingBriefInfo> foocketingsOfCategory = jdbcTemplate.query(
                FOOCKETINGS_OF_CATEGORY,
                this::mapToFoocketingBriefInfo,
                lng, lat, categoryId, LocalDateTime.now(), foocketingId
        );

        return FoocketingFailInfo.builder()
                .recommendedFoocketings(foocketingsOfCategory)
                .otherFoocketingsOfShop(foocketingsOfShop)
                .build();
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
}
