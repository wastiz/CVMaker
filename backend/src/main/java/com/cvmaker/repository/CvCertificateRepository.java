package com.cvmaker.repository;

import com.cvmaker.entity.CvCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvCertificateRepository extends JpaRepository<CvCertificate, Long> {
    List<CvCertificate> findAllByCvProfileIdOrderBySortOrderAsc(Long cvId);
}
