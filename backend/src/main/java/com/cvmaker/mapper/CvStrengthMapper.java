package com.cvmaker.mapper;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvStrength;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CvStrengthMapper {

    CvResponse.StrengthResponse toResponse(CvStrength strength);
}
