package com.cvmaker.repository;

import com.cvmaker.entity.CvStrength;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvStrengthRepository extends JpaRepository<CvStrength, Long> {
    List<CvStrength> findAllByCvProfileIdOrderBySortOrderAsc(Long cvId);
}
