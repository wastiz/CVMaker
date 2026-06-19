package com.cvmaker.mapper;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvProject;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CvProjectMapper {

    CvResponse.ProjectResponse toResponse(CvProject project);
}
