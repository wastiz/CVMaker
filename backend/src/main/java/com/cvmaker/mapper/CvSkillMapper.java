package com.cvmaker.mapper;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvSkill;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CvSkillMapper {

    @Mapping(target = "type", expression = "java(skill.getType().name())")
    CvResponse.SkillResponse toResponse(CvSkill skill);
}
