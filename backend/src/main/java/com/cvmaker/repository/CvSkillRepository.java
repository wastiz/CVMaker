package com.cvmaker.repository;

import com.cvmaker.entity.CvSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvSkillRepository extends JpaRepository<CvSkill, Long> {
    List<CvSkill> findAllByCvProfileIdOrderBySortOrderAsc(Long cvId);
}
