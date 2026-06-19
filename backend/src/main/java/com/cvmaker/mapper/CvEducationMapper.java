package com.cvmaker.mapper;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvEducation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CvEducationMapper {

    @Mapping(target = "isCurrent", source = "current")
    CvResponse.EducationResponse toResponse(CvEducation education);
}
