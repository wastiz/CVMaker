package com.cvmaker.mapper;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvCertificate;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CvCertificateMapper {

    CvResponse.CertificateResponse toResponse(CvCertificate certificate);
}
