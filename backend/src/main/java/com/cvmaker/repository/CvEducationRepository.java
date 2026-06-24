package com.cvmaker.repository;

import com.cvmaker.entity.CvEducation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvEducationRepository extends JpaRepository<CvEducation, Long> {
    List<CvEducation> findAllByCvProfileIdOrderBySortOrderAsc(Long cvId);
}
