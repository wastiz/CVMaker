package com.cvmaker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "cv_experience", schema = "cv")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CvProfile cvProfile;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String position;

    private String location;

    @Column(name = "start_date", nullable = false, length = 50)
    private String startDate;

    @Column(name = "end_date", length = 50)
    private String endDate;

    @Column(name = "is_current", nullable = false)
    @Builder.Default
    private boolean isCurrent = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> stack;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
