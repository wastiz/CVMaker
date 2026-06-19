package com.cvmaker.service;

import com.cvmaker.dto.request.CvCreateRequest;
import com.cvmaker.dto.request.CvUpdateRequest;
import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.dto.response.CvSummaryResponse;
import com.cvmaker.entity.*;
import com.cvmaker.exception.CvNotFoundException;
import com.cvmaker.mapper.CvMapper;
import com.cvmaker.repository.CvRepository;
import com.cvmaker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CvService {

    private final CvRepository cvRepository;
    private final UserRepository userRepository;
    private final CvMapper cvMapper;

    @Transactional(readOnly = true)
    public List<CvSummaryResponse> getAll(Long userId) {
        return cvRepository.findAllByUserIdAndDeletedFalseOrderByUpdatedAtDesc(userId)
                .stream()
                .map(cvMapper::toSummaryResponse)
                .toList();
    }

    @Transactional
    public CvResponse create(Long userId, CvCreateRequest req) {
        User user = userRepository.getReferenceById(userId);
        CvProfile cv = CvProfile.builder()
                .user(user)
                .title(req.title())
                .templateId(req.templateId() != null ? req.templateId() : "classic")
                .firstName(req.firstName())
                .lastName(req.lastName())
                .email(req.email())
                .phone(req.phone())
                .location(req.location())
                .github(req.github())
                .linkedin(req.linkedin())
                .portfolio(req.portfolio())
                .otherLink(req.otherLink())
                .summary(req.summary())
                .driverLicense(req.driverLicense())
                .build();
        cvRepository.save(cv);
        return cvMapper.toResponse(cv);
    }

    @Transactional(readOnly = true)
    public CvResponse getById(Long userId, Long cvId) {
        CvProfile cv = findOwnedActive(userId, cvId);
        return cvMapper.toResponse(cv);
    }

    @Transactional
    public CvResponse update(Long userId, Long cvId, CvUpdateRequest req) {
        CvProfile cv = findOwnedActive(userId, cvId);
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
        cvRepository.save(cv);
        return cvMapper.toResponse(cv);
    }

    @Transactional
    public void softDelete(Long userId, Long cvId) {
        CvProfile cv = findOwnedActive(userId, cvId);
        cv.setDeleted(true);
        cvRepository.save(cv);
    }

    @Transactional
    public CvResponse duplicate(Long userId, Long cvId) {
        CvProfile src = findOwnedActive(userId, cvId);
        User user = userRepository.getReferenceById(userId);

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
        return cvMapper.toResponse(copy);
    }

    private CvProfile findOwnedActive(Long userId, Long cvId) {
        return cvRepository.findByIdAndUserIdAndDeletedFalse(cvId, userId)
                .orElseThrow(() -> new CvNotFoundException(cvId));
    }
}
