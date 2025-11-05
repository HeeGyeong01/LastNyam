package com.lastnyam.owner.report.repository;

import com.lastnyam.database.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    Report findByShopId(Integer shopId);
}
