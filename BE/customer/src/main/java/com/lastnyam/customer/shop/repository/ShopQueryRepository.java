package com.lastnyam.customer.shop.repository;

import com.lastnyam.customer.global.dto.ShopInfo;
import com.lastnyam.customer.global.dto.ShopInfoWithMenu;
import com.lastnyam.customer.shop.exception.ShopErrorCode;
import com.lastnyam.customer.shop.exception.ShopException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ShopQueryRepository {

    private static final String SHOP_INFO_QUERY = """
            SELECT s.shop_id, s.shop_name, s.shop_lat, s.shop_lng,s.shop_banner,
            ST_Distance(
                               ST_Point(?, ?)::geography,
                               ST_Point(s.shop_lng, s.shop_lat)::geography
                            ) as distance,
                            COALESCE(sr.shop_rating_avg, 0) as shop_rating_avg,
                            COALESCE(sr.shop_rating_count, 0) as shop_rating_count
            FROM shops s
            LEFT JOIN shop_ratings sr ON s.shop_id = sr.shop_id
            WHERE s.shop_id = ?;
            """;
    private static final String MENU_QUERY = """
            SELECT m.menu_name
            FROM discounts d
            JOIN menu m ON d.menu_id = m.menu_id
            WHERE m.shop_id = ? AND d.discount_date = ?
            ORDER BY d.discount_id DESC
            LIMIT 6;
            """;
    private final JdbcTemplate jdbcTemplate;

    public ShopInfoWithMenu getShopInfoWithMenuOf(Integer shopId, double lat, double lng) {
        ShopInfo info;
        try {
            info = jdbcTemplate.queryForObject(
                    SHOP_INFO_QUERY,
                    this::mapToShopInfo,
                    lng, lat, shopId
            );
        } catch (EmptyResultDataAccessException e) {
            throw new ShopException(ShopErrorCode.SHOP_NOT_FOUND);
        }

        List<String> menus = jdbcTemplate.query(
                MENU_QUERY,
                (rs, rn) -> rs.getString("menu_name"),
                shopId, LocalDate.now()
        );

        return ShopInfoWithMenu.of(info, menus);
    }

    private ShopInfo mapToShopInfo(ResultSet rs, int rowNum) throws SQLException {
        Integer shopId = rs.getInt("shop_id");
        String shopName = rs.getString("shop_name");
        Double lat = rs.getDouble("shop_lat");
        Double lng = rs.getDouble("shop_lng");
        Double distance = rs.getDouble("distance");
        String banner = rs.getString("shop_banner");
        Double ratingAvg = rs.getDouble("shop_rating_avg");
        Integer ratingCount = rs.getInt("shop_rating_count");

        distance = Math.round((distance / 1000.0) * 10.0) / 10.0;

        return ShopInfo.builder()
                .name(shopName)
                .shopId(shopId)
                .lat(lat)
                .lng(lng)
                .distance(distance)
                .bannerUrl(banner)
                .rating(ratingAvg)
                .ratingCount(ratingCount)
                .build();
    }
}
