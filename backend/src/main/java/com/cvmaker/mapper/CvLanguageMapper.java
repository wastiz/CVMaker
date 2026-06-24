package com.cvmaker.mapper;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvLanguage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CvLanguageMapper {

    CvResponse.LanguageResponse toResponse(CvLanguage language);
}
