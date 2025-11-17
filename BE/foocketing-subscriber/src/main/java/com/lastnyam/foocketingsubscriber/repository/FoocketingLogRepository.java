package com.lastnyam.foocketingsubscriber.repository;

import com.lastnyam.database.entity.FoocketingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FoocketingLogRepository extends JpaRepository<FoocketingLog, Integer> {

    @Query(value = """
                SELECT t.result_rank
                FROM (
                    SELECT
                        user_id,
                        ROW_NUMBER() OVER (ORDER BY log_user_rank ASC) AS result_rank
                    FROM foocketing_log f
                    WHERE foocketing_id = :foocketingId
                ) t
                WHERE t.user_id = :userId
                ORDER BY t.result_rank
                LIMIT 1
            """, nativeQuery = true)
    Integer findUserRank(@Param("foocketingId") Integer foocketingId, @Param("userId") Integer userId);

}
