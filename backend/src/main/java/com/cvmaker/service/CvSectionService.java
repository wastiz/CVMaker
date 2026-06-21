package com.cvmaker.service;

import com.cvmaker.dto.request.*;
import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.*;
import com.cvmaker.exception.CvNotFoundException;
import com.cvmaker.mapper.*;
import com.cvmaker.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CvSectionService {

    private final CvRepository cvRepository;
    private final CvSkillRepository skillRepository;
    private final CvLanguageRepository languageRepository;
    private final CvExperienceRepository experienceRepository;
    private final CvProjectRepository projectRepository;
    private final CvEducationRepository educationRepository;
    private final CvCertificateRepository certificateRepository;
    private final CvSkillMapper skillMapper;
    private final CvLanguageMapper languageMapper;
    private final CvExperienceMapper experienceMapper;
    private final CvProjectMapper projectMapper;
    private final CvEducationMapper educationMapper;
    private final CvCertificateMapper certificateMapper;

    private CvProfile owned(Long userId, Long cvId) {
        return cvRepository.findByIdAndUserIdAndDeletedFalse(cvId, userId)
                .orElseThrow(() -> new CvNotFoundException(cvId));
    }

    // ─── Skills ──────────────────────────────────────────────────────────────

    @Transactional
    public CvResponse.SkillResponse createSkill(Long userId, Long cvId, CvSkillRequest req) {
        CvProfile cv = owned(userId, cvId);
        CvSkill skill = CvSkill.builder()
                .cvProfile(cv).type(req.type()).name(req.name()).sortOrder(req.sortOrder())
                .showType(req.showType())
                .build();
        return skillMapper.toResponse(skillRepository.save(skill));
    }

    @Transactional
    public CvResponse.SkillResponse updateSkill(Long userId, Long cvId, Long skillId, CvSkillRequest req) {
        owned(userId, cvId);
        CvSkill skill = skillRepository.findById(skillId)
                .filter(s -> s.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Skill " + skillId + " not found"));
        skill.setType(req.type());
        skill.setName(req.name());
        skill.setSortOrder(req.sortOrder());
        skill.setShowType(req.showType());
        return skillMapper.toResponse(skillRepository.save(skill));
    }

    @Transactional
    public void deleteSkill(Long userId, Long cvId, Long skillId) {
        owned(userId, cvId);
        CvSkill skill = skillRepository.findById(skillId)
                .filter(s -> s.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Skill " + skillId + " not found"));
        skillRepository.delete(skill);
    }

    // ─── Languages ───────────────────────────────────────────────────────────

    @Transactional
    public CvResponse.LanguageResponse createLanguage(Long userId, Long cvId, CvLanguageRequest req) {
        CvProfile cv = owned(userId, cvId);
        CvLanguage lang = CvLanguage.builder()
                .cvProfile(cv).language(req.language()).level(req.level()).sortOrder(req.sortOrder())
                .build();
        return languageMapper.toResponse(languageRepository.save(lang));
    }

    @Transactional
    public CvResponse.LanguageResponse updateLanguage(Long userId, Long cvId, Long langId, CvLanguageRequest req) {
        owned(userId, cvId);
        CvLanguage lang = languageRepository.findById(langId)
                .filter(l -> l.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Language " + langId + " not found"));
        lang.setLanguage(req.language());
        lang.setLevel(req.level());
        lang.setSortOrder(req.sortOrder());
        return languageMapper.toResponse(languageRepository.save(lang));
    }

    @Transactional
    public void deleteLanguage(Long userId, Long cvId, Long langId) {
        owned(userId, cvId);
        CvLanguage lang = languageRepository.findById(langId)
                .filter(l -> l.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Language " + langId + " not found"));
        languageRepository.delete(lang);
    }

    // ─── Experience ──────────────────────────────────────────────────────────

    @Transactional
    public CvResponse.ExperienceResponse createExperience(Long userId, Long cvId, CvExperienceRequest req) {
        CvProfile cv = owned(userId, cvId);
        CvExperience exp = CvExperience.builder()
                .cvProfile(cv).company(req.company()).position(req.position())
                .location(req.location()).startDate(req.startDate()).endDate(req.endDate())
                .isCurrent(req.isCurrent()).description(req.description()).stack(req.stack())
                .sortOrder(req.sortOrder())
                .build();
        return experienceMapper.toResponse(experienceRepository.save(exp));
    }

    @Transactional
    public CvResponse.ExperienceResponse updateExperience(Long userId, Long cvId, Long expId, CvExperienceRequest req) {
        owned(userId, cvId);
        CvExperience exp = experienceRepository.findById(expId)
                .filter(e -> e.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Experience " + expId + " not found"));
        exp.setCompany(req.company());
        exp.setPosition(req.position());
        exp.setLocation(req.location());
        exp.setStartDate(req.startDate());
        exp.setEndDate(req.endDate());
        exp.setCurrent(req.isCurrent());
        exp.setDescription(req.description());
        exp.setStack(req.stack());
        exp.setSortOrder(req.sortOrder());
        return experienceMapper.toResponse(experienceRepository.save(exp));
    }

    @Transactional
    public void deleteExperience(Long userId, Long cvId, Long expId) {
        owned(userId, cvId);
        CvExperience exp = experienceRepository.findById(expId)
                .filter(e -> e.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Experience " + expId + " not found"));
        experienceRepository.delete(exp);
    }

    // ─── Projects ────────────────────────────────────────────────────────────

    @Transactional
    public CvResponse.ProjectResponse createProject(Long userId, Long cvId, CvProjectRequest req) {
        CvProfile cv = owned(userId, cvId);
        CvProject proj = CvProject.builder()
                .cvProfile(cv).name(req.name()).url(req.url()).description(req.description())
                .bulletPoints(req.bulletPoints()).stack(req.stack()).sortOrder(req.sortOrder())
                .build();
        return projectMapper.toResponse(projectRepository.save(proj));
    }

    @Transactional
    public CvResponse.ProjectResponse updateProject(Long userId, Long cvId, Long projId, CvProjectRequest req) {
        owned(userId, cvId);
        CvProject proj = projectRepository.findById(projId)
                .filter(p -> p.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Project " + projId + " not found"));
        proj.setName(req.name());
        proj.setUrl(req.url());
        proj.setDescription(req.description());
        proj.setBulletPoints(req.bulletPoints());
        proj.setStack(req.stack());
        proj.setSortOrder(req.sortOrder());
        return projectMapper.toResponse(projectRepository.save(proj));
    }

    @Transactional
    public void deleteProject(Long userId, Long cvId, Long projId) {
        owned(userId, cvId);
        CvProject proj = projectRepository.findById(projId)
                .filter(p -> p.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Project " + projId + " not found"));
        projectRepository.delete(proj);
    }

    // ─── Education ───────────────────────────────────────────────────────────

    @Transactional
    public CvResponse.EducationResponse createEducation(Long userId, Long cvId, CvEducationRequest req) {
        CvProfile cv = owned(userId, cvId);
        CvEducation edu = CvEducation.builder()
                .cvProfile(cv).institution(req.institution()).degree(req.degree())
                .fieldOfStudy(req.fieldOfStudy()).startDate(req.startDate()).endDate(req.endDate())
                .isCurrent(req.isCurrent()).description(req.description()).sortOrder(req.sortOrder())
                .build();
        return educationMapper.toResponse(educationRepository.save(edu));
    }

    @Transactional
    public CvResponse.EducationResponse updateEducation(Long userId, Long cvId, Long eduId, CvEducationRequest req) {
        owned(userId, cvId);
        CvEducation edu = educationRepository.findById(eduId)
                .filter(e -> e.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Education " + eduId + " not found"));
        edu.setInstitution(req.institution());
        edu.setDegree(req.degree());
        edu.setFieldOfStudy(req.fieldOfStudy());
        edu.setStartDate(req.startDate());
        edu.setEndDate(req.endDate());
        edu.setCurrent(req.isCurrent());
        edu.setDescription(req.description());
        edu.setSortOrder(req.sortOrder());
        return educationMapper.toResponse(educationRepository.save(edu));
    }

    @Transactional
    public void deleteEducation(Long userId, Long cvId, Long eduId) {
        owned(userId, cvId);
        CvEducation edu = educationRepository.findById(eduId)
                .filter(e -> e.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Education " + eduId + " not found"));
        educationRepository.delete(edu);
    }

    // ─── Certificates ────────────────────────────────────────────────────────

    @Transactional
    public CvResponse.CertificateResponse createCertificate(Long userId, Long cvId, CvCertificateRequest req) {
        CvProfile cv = owned(userId, cvId);
        CvCertificate cert = CvCertificate.builder()
                .cvProfile(cv).name(req.name()).issuer(req.issuer())
                .issueDate(req.issueDate()).url(req.url()).sortOrder(req.sortOrder())
                .build();
        return certificateMapper.toResponse(certificateRepository.save(cert));
    }

    @Transactional
    public CvResponse.CertificateResponse updateCertificate(Long userId, Long cvId, Long certId, CvCertificateRequest req) {
        owned(userId, cvId);
        CvCertificate cert = certificateRepository.findById(certId)
                .filter(c -> c.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Certificate " + certId + " not found"));
        cert.setName(req.name());
        cert.setIssuer(req.issuer());
        cert.setIssueDate(req.issueDate());
        cert.setUrl(req.url());
        cert.setSortOrder(req.sortOrder());
        return certificateMapper.toResponse(certificateRepository.save(cert));
    }

    @Transactional
    public void deleteCertificate(Long userId, Long cvId, Long certId) {
        owned(userId, cvId);
        CvCertificate cert = certificateRepository.findById(certId)
                .filter(c -> c.getCvProfile().getId().equals(cvId))
                .orElseThrow(() -> new EntityNotFoundException("Certificate " + certId + " not found"));
        certificateRepository.delete(cert);
    }
}
