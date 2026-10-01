package com.cvmaker.repository;

import com.cvmaker.entity.CvSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CvSkillRepository extends JpaRepository<CvSkill, Long> {
    List<CvSkill> findAllByCvProfileIdOrderBySortOrderAsc(Long cvId);

    /** Every distinct skill type used across the user's non-deleted CVs. */
    @Query("""
            select distinct s.type from CvSkill s
            where s.cvProfile.user.id = :userId and s.cvProfile.deleted = false
            order by s.type asc
            """)
    List<String> findDistinctTypesByUserId(@Param("userId") Long userId);
}
