package com.cvmaker.mapper;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvExperience;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CvExperienceMapper {

    @Mapping(target = "isCurrent", source = "current")
    CvResponse.ExperienceResponse toResponse(CvExperience experience);
}
