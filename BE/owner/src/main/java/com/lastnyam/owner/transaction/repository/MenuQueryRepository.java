package com.lastnyam.owner.transaction.repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MenuQueryRepository {

    private static final String GET_CATEGORY_COUNT_FROM_TRANSACTION = """
            SELECT m.category_id,
                   SUM(dti.transaction_amount) AS total_amount
            FROM discount_transaction_items dti
            JOIN discounts d ON dti.discount_id = d.discount_id
            JOIN menus m ON d.menu_id = m.menu_id
            WHERE dti.transaction_id = ?
            GROUP BY m.category_id;
            """;
    private final JdbcTemplate jdbcTemplate;

    public Map<Integer, Integer> getCategoryCountOf(Integer transactionId) {

        return jdbcTemplate.query(GET_CATEGORY_COUNT_FROM_TRANSACTION,
                ps -> ps.setInt(1, transactionId),
                (rs) -> {
                    Map<Integer, Integer> result = new HashMap<>();
                    while (rs.next()) {
                        int categoryId = rs.getInt("category_id");
                        int totalAmount = rs.getInt("total_amount");
                        result.put(categoryId, totalAmount);
                    }
                    return result;
                }
        );
    }

    public void applyCategoryCounts(Map<Integer, Integer> categoryCountMap) {
        if (categoryCountMap.isEmpty()) {
            return;
        }

        StringBuilder sql = new StringBuilder("""
                    UPDATE food_categories fc
                    SET category_survived = fc.category_survived + v.delta
                    FROM (
                """);

        List<Object> params = new ArrayList<>();
        int i = 0;
        for (Map.Entry<Integer, Integer> entry : categoryCountMap.entrySet()) {
            if (i++ > 0) {
                sql.append(", ");
            }
            sql.append("(?, ?)");
            params.add(entry.getKey());   // category_id
            params.add(entry.getValue()); // delta
        }

        sql.append(") AS v(category_id, delta) WHERE fc.category_id = v.category_id");

        jdbcTemplate.update(sql.toString(), params.toArray());
    }
}
