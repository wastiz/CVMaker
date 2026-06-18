package com.cvmaker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cv_languages", schema = "cv")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CvProfile cvProfile;

    @Column(nullable = false, length = 100)
    private String language;

    @Column(length = 50)
    private String level;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
