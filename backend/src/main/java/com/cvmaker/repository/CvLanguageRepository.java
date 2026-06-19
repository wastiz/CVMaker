package com.cvmaker.repository;

import com.cvmaker.entity.CvLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvLanguageRepository extends JpaRepository<CvLanguage, Long> {
    List<CvLanguage> findAllByCvProfileIdOrderBySortOrderAsc(Long cvId);
}
