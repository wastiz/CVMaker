package com.cvmaker.repository;

import com.cvmaker.entity.CvExperience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvExperienceRepository extends JpaRepository<CvExperience, Long> {
    List<CvExperience> findAllByCvProfileIdOrderBySortOrderAsc(Long cvId);
}
