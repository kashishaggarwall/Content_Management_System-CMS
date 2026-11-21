package com.CMS.service;

import com.CMS.dto.LoginRequestDTO;
import com.CMS.dto.LoginResponseDTO;
import com.CMS.entity.Permission;
import com.CMS.entity.User;
import com.CMS.repository.UserRepository;
import com.CMS.security.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public AuthService(UserRepository userRepository, ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Check user active status
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Your account is " + user.getStatus().toLowerCase() +
                    ". Please contact a system administrator.");
        }

        // Verify password (supports BCrypt and seed SHA-256 demo passwords)
        boolean valid = PasswordUtil.verifyPassword(request.getPassword(), user.getPasswordHash());
        if (!valid) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Seamlessly upgrade legacy SHA-256 password to BCrypt
        if (PasswordUtil.isLegacySha256(user.getPasswordHash())) {
            user.setPasswordHash(PasswordUtil.hashPassword(request.getPassword()));
            userRepository.save(user);
        }

        // Generate session token
        String token = "cms-auth-" + UUID.randomUUID();

        // Extract permissions
        List<String> permissions = List.of();
        String roleName = "USER";
        if (user.getRole() != null) {
            roleName = user.getRole().getRoleName();
            if (user.getRole().getPermissions() != null) {
                permissions = user.getRole().getPermissions().stream()
                        .map(Permission::getPermissionKey)
                        .collect(Collectors.toList());
            }
        }

        // Log login event
        activityLogService.log(user.getUserId(), null, "USER_LOGIN", "AUTH",
                "User logged in: " + user.getEmail() + " (" + roleName + ")");

        LoginResponseDTO response = new LoginResponseDTO();
        response.setToken(token);
        response.setUserId(user.getUserId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(roleName);
        response.setStatus(user.getStatus());
        response.setPermissions(permissions);

        return response;
    }

    public void logout(Long userId) {
        if (userId != null) {
            activityLogService.log(userId, null, "USER_LOGOUT", "AUTH", "User logged out");
        }
    }
}
