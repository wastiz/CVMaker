package com.cvmaker.service;

import com.cvmaker.config.JwtConfig;
import com.cvmaker.dto.request.LoginRequest;
import com.cvmaker.dto.request.RegisterRequest;
import com.cvmaker.dto.response.AuthResponse;
import com.cvmaker.dto.response.UserResponse;
import com.cvmaker.entity.JobTracker;
import com.cvmaker.entity.RefreshToken;
import com.cvmaker.entity.User;
import com.cvmaker.exception.UnauthorizedException;
import com.cvmaker.repository.JobTrackerRepository;
import com.cvmaker.repository.RefreshTokenRepository;
import com.cvmaker.repository.UserRepository;
import com.cvmaker.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JobTrackerRepository jobTrackerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final JwtConfig jwtConfig;

    @Transactional
    public AuthResponse register(RegisterRequest req, HttpServletResponse response) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .build();
        userRepository.save(user);

        jobTrackerRepository.save(JobTracker.builder().user(user).build());

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshTokenValue = issueRefreshToken(user);
        setRefreshTokenCookie(response, refreshTokenValue);
        setAccessTokenCookie(response, accessToken);

        return new AuthResponse(accessToken, toUserResponse(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletResponse response) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        refreshTokenRepository.deleteByUser(user);

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshTokenValue = issueRefreshToken(user);
        setRefreshTokenCookie(response, refreshTokenValue);
        setAccessTokenCookie(response, accessToken);

        return new AuthResponse(accessToken, toUserResponse(user));
    }

    @Transactional
    public String refresh(String refreshTokenValue) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token expired");
        }

        return tokenProvider.generateAccessToken(token.getUser().getId(), token.getUser().getEmail());
    }

    @Transactional
    public void logout(String refreshTokenValue, HttpServletResponse response) {
        if (refreshTokenValue != null) {
            refreshTokenRepository.deleteByToken(refreshTokenValue);
        }
        clearRefreshTokenCookie(response);
        clearAccessTokenCookie(response);
    }

    private String issueRefreshToken(User user) {
        String value = UUID.randomUUID().toString();
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(value)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtConfig.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(token);
        return value;
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String value) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", value)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(jwtConfig.getRefreshExpirationMs() / 1000)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void setAccessTokenCookie(HttpServletResponse response, String accessToken) {
        ResponseCookie cookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(false)
                .secure(false)
                .path("/")
                .maxAge(jwtConfig.getExpirationMs() / 1000)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearAccessTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .httpOnly(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName());
    }
}
