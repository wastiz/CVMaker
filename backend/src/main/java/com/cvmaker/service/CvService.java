package com.cvmaker.service;

import com.cvmaker.dto.request.CvRequest;
import com.cvmaker.dto.response.CvListResponse;
import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.*;
import com.cvmaker.exception.CvNotFoundException;
import com.cvmaker.repository.CvRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CvService {

    private final CvRepository cvRepository;

    public List<CvListResponse> listCvs(User user) {
        return cvRepository.findByUserAndDeletedFalseOrderByUpdatedAtDesc(user).stream()
                .map(cv -> new CvListResponse(cv.getId(), cv.getTitle(), cv.getTemplateId(),
                        cv.getFirstName(), cv.getLastName(), cv.getUpdatedAt()))
                .toList();
    }

    @Transactional
    public CvResponse createCv(User user, CvRequest req) {
        CvProfile cv = buildProfile(user, req);
        cvRepository.save(cv);
        return toResponse(cv);
    }

    public CvResponse getCv(User user, Long id) {
        CvProfile cv = findOwned(user, id);
        return toResponse(cv);
    }

    @Transactional
    public CvResponse updateCv(User user, Long id, CvRequest req) {
        CvProfile cv = findOwned(user, id);
        applyFields(cv, req);
        replaceCollections(cv, req);
        cvRepository.save(cv);
        return toResponse(cv);
    }

    @Transactional
    public void deleteCv(User user, Long id) {
        CvProfile cv = findOwned(user, id);
        cv.setDeleted(true);
        cvRepository.save(cv);
    }

    @Transactional
    public CvResponse duplicateCv(User user, Long id) {
        CvProfile src = findOwned(user, id);
        CvProfile copy = CvProfile.builder()
                .user(user)
                .title(src.getTitle() + " (copy)")
                .templateId(src.getTemplateId())
                .firstName(src.getFirstName())
                .lastName(src.getLastName())
                .email(src.getEmail())
                .phone(src.getPhone())
                .location(src.getLocation())
                .github(src.getGithub())
                .linkedin(src.getLinkedin())
                .portfolio(src.getPortfolio())
                .otherLink(src.getOtherLink())
                .summary(src.getSummary())
                .driverLicense(src.getDriverLicense())
                .build();

        src.getSkills().forEach(s -> copy.getSkills().add(
                CvSkill.builder().cvProfile(copy).type(s.getType()).name(s.getName()).sortOrder(s.getSortOrder()).build()));
        src.getLanguages().forEach(l -> copy.getLanguages().add(
                CvLanguage.builder().cvProfile(copy).language(l.getLanguage()).level(l.getLevel()).sortOrder(l.getSortOrder()).build()));
        src.getExperiences().forEach(e -> copy.getExperiences().add(
                CvExperience.builder().cvProfile(copy).company(e.getCompany()).position(e.getPosition())
                        .location(e.getLocation()).startDate(e.getStartDate()).endDate(e.getEndDate())
                        .isCurrent(e.isCurrent()).description(e.getDescription()).stack(e.getStack())
                        .sortOrder(e.getSortOrder()).build()));
        src.getProjects().forEach(p -> copy.getProjects().add(
                CvProject.builder().cvProfile(copy).name(p.getName()).url(p.getUrl())
                        .description(p.getDescription()).bulletPoints(p.getBulletPoints())
                        .stack(p.getStack()).sortOrder(p.getSortOrder()).build()));
        src.getEducations().forEach(e -> copy.getEducations().add(
                CvEducation.builder().cvProfile(copy).institution(e.getInstitution()).degree(e.getDegree())
                        .fieldOfStudy(e.getFieldOfStudy()).startDate(e.getStartDate()).endDate(e.getEndDate())
                        .isCurrent(e.isCurrent()).description(e.getDescription()).sortOrder(e.getSortOrder()).build()));
        src.getCertificates().forEach(c -> copy.getCertificates().add(
                CvCertificate.builder().cvProfile(copy).name(c.getName()).issuer(c.getIssuer())
                        .issueDate(c.getIssueDate()).url(c.getUrl()).sortOrder(c.getSortOrder()).build()));

        cvRepository.save(copy);
        return toResponse(copy);
    }

    private CvProfile findOwned(User user, Long id) {
        return cvRepository.findByIdAndUserAndDeletedFalse(id, user)
                .orElseThrow(() -> new CvNotFoundException(id));
    }

    private CvProfile buildProfile(User user, CvRequest req) {
        CvProfile cv = CvProfile.builder()
                .user(user)
                .title(req.title())
                .templateId(req.templateId() != null ? req.templateId() : "classic")
                .build();
        applyFields(cv, req);
        replaceCollections(cv, req);
        return cv;
    }

    private void applyFields(CvProfile cv, CvRequest req) {
        cv.setTitle(req.title());
        if (req.templateId() != null) cv.setTemplateId(req.templateId());
        cv.setFirstName(req.firstName());
        cv.setLastName(req.lastName());
        cv.setEmail(req.email());
        cv.setPhone(req.phone());
        cv.setLocation(req.location());
        cv.setGithub(req.github());
        cv.setLinkedin(req.linkedin());
        cv.setPortfolio(req.portfolio());
        cv.setOtherLink(req.otherLink());
        cv.setSummary(req.summary());
        cv.setDriverLicense(req.driverLicense());
    }

    private void replaceCollections(CvProfile cv, CvRequest req) {
        cv.getSkills().clear();
        if (req.skills() != null) req.skills().forEach(s ->
                cv.getSkills().add(CvSkill.builder().cvProfile(cv).type(s.type()).name(s.name()).sortOrder(s.sortOrder()).build()));

        cv.getLanguages().clear();
        if (req.languages() != null) req.languages().forEach(l ->
                cv.getLanguages().add(CvLanguage.builder().cvProfile(cv).language(l.language()).level(l.level()).sortOrder(l.sortOrder()).build()));

        cv.getExperiences().clear();
        if (req.experiences() != null) req.experiences().forEach(e ->
                cv.getExperiences().add(CvExperience.builder().cvProfile(cv).company(e.company()).position(e.position())
                        .location(e.location()).startDate(e.startDate()).endDate(e.endDate())
                        .isCurrent(e.isCurrent()).description(e.description()).stack(e.stack())
                        .sortOrder(e.sortOrder()).build()));

        cv.getProjects().clear();
        if (req.projects() != null) req.projects().forEach(p ->
                cv.getProjects().add(CvProject.builder().cvProfile(cv).name(p.name()).url(p.url())
                        .description(p.description()).bulletPoints(p.bulletPoints()).stack(p.stack())
                        .sortOrder(p.sortOrder()).build()));

        cv.getEducations().clear();
        if (req.educations() != null) req.educations().forEach(e ->
                cv.getEducations().add(CvEducation.builder().cvProfile(cv).institution(e.institution()).degree(e.degree())
                        .fieldOfStudy(e.fieldOfStudy()).startDate(e.startDate()).endDate(e.endDate())
                        .isCurrent(e.isCurrent()).description(e.description()).sortOrder(e.sortOrder()).build()));

        cv.getCertificates().clear();
        if (req.certificates() != null) req.certificates().forEach(c ->
                cv.getCertificates().add(CvCertificate.builder().cvProfile(cv).name(c.name()).issuer(c.issuer())
                        .issueDate(c.issueDate()).url(c.url()).sortOrder(c.sortOrder()).build()));
    }

    CvResponse toResponse(CvProfile cv) {
        return new CvResponse(
                cv.getId(), cv.getTitle(), cv.getTemplateId(),
                cv.getFirstName(), cv.getLastName(), cv.getEmail(), cv.getPhone(),
                cv.getLocation(), cv.getGithub(), cv.getLinkedin(), cv.getPortfolio(),
                cv.getOtherLink(), cv.getSummary(), cv.getDriverLicense(),
                cv.getCreatedAt(), cv.getUpdatedAt(),
                cv.getSkills().stream().map(s -> new CvResponse.SkillResponse(s.getId(), s.getType(), s.getName(), s.getSortOrder())).toList(),
                cv.getLanguages().stream().map(l -> new CvResponse.LanguageResponse(l.getId(), l.getLanguage(), l.getLevel(), l.getSortOrder())).toList(),
                cv.getExperiences().stream().map(e -> new CvResponse.ExperienceResponse(e.getId(), e.getCompany(), e.getPosition(), e.getLocation(), e.getStartDate(), e.getEndDate(), e.isCurrent(), e.getDescription(), e.getStack(), e.getSortOrder())).toList(),
                cv.getProjects().stream().map(p -> new CvResponse.ProjectResponse(p.getId(), p.getName(), p.getUrl(), p.getDescription(), p.getBulletPoints(), p.getStack(), p.getSortOrder())).toList(),
                cv.getEducations().stream().map(e -> new CvResponse.EducationResponse(e.getId(), e.getInstitution(), e.getDegree(), e.getFieldOfStudy(), e.getStartDate(), e.getEndDate(), e.isCurrent(), e.getDescription(), e.getSortOrder())).toList(),
                cv.getCertificates().stream().map(c -> new CvResponse.CertificateResponse(c.getId(), c.getName(), c.getIssuer(), c.getIssueDate(), c.getUrl(), c.getSortOrder())).toList()
        );
    }
}
