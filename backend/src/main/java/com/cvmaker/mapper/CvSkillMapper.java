package com.cvmaker.mapper;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvSkill;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CvSkillMapper {

    CvResponse.SkillResponse toResponse(CvSkill skill);
}
