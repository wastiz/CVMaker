package com.cvmaker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cv_certificates", schema = "cv")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CvProfile cvProfile;

    @Column(nullable = false)
    private String name;

    private String issuer;

    @Column(name = "issue_date", length = 50)
    private String issueDate;

    @Column(length = 500)
    private String url;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
