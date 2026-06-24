package com.cvmaker.repository;

import com.cvmaker.entity.CvProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvProjectRepository extends JpaRepository<CvProject, Long> {
    List<CvProject> findAllByCvProfileIdOrderBySortOrderAsc(Long cvId);
}
