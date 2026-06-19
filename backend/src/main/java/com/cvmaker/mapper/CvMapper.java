package com.cvmaker.mapper;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.dto.response.CvSummaryResponse;
import com.cvmaker.entity.CvProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                CvSkillMapper.class,
                CvLanguageMapper.class,
                CvExperienceMapper.class,
                CvProjectMapper.class,
                CvEducationMapper.class,
                CvCertificateMapper.class
        }
)
public interface CvMapper {

    @Mapping(target = "skills", source = "skills")
    @Mapping(target = "languages", source = "languages")
    @Mapping(target = "experiences", source = "experiences")
    @Mapping(target = "projects", source = "projects")
    @Mapping(target = "educations", source = "educations")
    @Mapping(target = "certificates", source = "certificates")
    CvResponse toResponse(CvProfile profile);

    CvSummaryResponse toSummaryResponse(CvProfile profile);
}
