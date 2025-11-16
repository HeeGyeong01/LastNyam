package com.lastnyam.customer.foocketing.repository;

import com.lastnyam.customer.foocketing.exception.FoocketingErrorCode;
import com.lastnyam.customer.foocketing.exception.FoocketingException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FoocketingRankRepository {

    private static final String RANK_QUERY = """
            SELECT
                t.result_rank
            FROM (
                SELECT
                    user_id,
                    ROW_NUMBER() OVER (
                        ORDER BY log_user_rank ASC
                    ) AS result_rank
                FROM foocketing_log f
                WHERE foocketing_id = ?
            ) t
            WHERE user_id = ?
            ORDER BY t.result_rank
            LIMIT 1;
            """;
    private final JdbcTemplate jdbcTemplate;

    public Integer getRankOf(Integer userId, Integer foocketingId) {
        List<Integer> result = jdbcTemplate.query(RANK_QUERY,
                (rs, rowNum) -> rs.getInt("result_rank")
                , foocketingId, userId);

        if (result.isEmpty()) {
            throw new FoocketingException(FoocketingErrorCode.FOOCKETING_NO_ENTRY);
        }

        return result.getFirst();
    }
}
