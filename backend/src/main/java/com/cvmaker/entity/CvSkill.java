package com.cvmaker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cv_skills", schema = "cv")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CvProfile cvProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SkillType type;

    @Column(nullable = false)
    private String name;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @Column(name = "show_type", nullable = false)
    @Builder.Default
    private boolean showType = true;
}
