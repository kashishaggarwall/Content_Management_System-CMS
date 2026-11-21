package com.CMS.service;

import com.CMS.dto.UserCreateUpdateDTO;
import com.CMS.dto.UserDTO;
import com.CMS.entity.Role;
import com.CMS.entity.User;
import com.CMS.repository.RoleRepository;
import com.CMS.repository.UserRepository;
import com.CMS.security.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ActivityLogService activityLogService;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAllWithRole()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> searchUsers(String query) {
        return userRepository.searchUsers(query != null ? query.trim() : null)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO createUser(UserCreateUpdateDTO dto, Long performedByUserId) {
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (dto.getFullName() == null || dto.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        String email = dto.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("A user with this email already exists: " + email);
        }

        Role role = null;
        if (dto.getRoleId() != null) {
            role = roleRepository.findById(dto.getRoleId()).orElse(null);
        }
        if (role == null) {
            // Default to PRODUCER (role_id 2)
            role = roleRepository.findById(2L)
                    .orElseGet(() -> roleRepository.findAll().stream().findFirst().orElseThrow());
        }

        User user = new User();
        user.setFullName(dto.getFullName().trim());
        user.setEmail(email);
        user.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);
        user.setPasswordHash(PasswordUtil.hashPassword(dto.getPassword()));
        user.setStatus(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus().toUpperCase() : "ACTIVE");
        user.setRole(role);

        User saved = userRepository.save(user);

        activityLogService.log(performedByUserId, null, "USER_CREATE", "USER",
                "Created user: " + saved.getFullName() + " (" + saved.getEmail() + ") with role " + role.getRoleName());

        return convertToDTO(saved);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserCreateUpdateDTO dto, Long performedByUserId) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            String email = dto.getEmail().trim().toLowerCase();
            if (userRepository.existsByEmailAndUserIdNot(email, id)) {
                throw new IllegalArgumentException("Email is already in use by another user: " + email);
            }
            existing.setEmail(email);
        }

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            existing.setFullName(dto.getFullName().trim());
        }

        if (dto.getPhone() != null) {
            existing.setPhone(dto.getPhone().trim());
        }

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            existing.setStatus(dto.getStatus().toUpperCase());
        }

        if (dto.getRoleId() != null) {
            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + dto.getRoleId()));
            existing.setRole(role);
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            existing.setPasswordHash(PasswordUtil.hashPassword(dto.getPassword()));
        }

        User saved = userRepository.save(existing);

        activityLogService.log(performedByUserId, null, "USER_UPDATE", "USER",
                "Updated user details for: " + saved.getFullName() + " (ID: " + saved.getUserId() + ")");

        return convertToDTO(saved);
    }

    @Transactional
    public UserDTO toggleUserStatus(Long id, Long performedByUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        String newStatus = "ACTIVE".equalsIgnoreCase(user.getStatus()) ? "INACTIVE" : "ACTIVE";
        user.setStatus(newStatus);
        User saved = userRepository.save(user);

        activityLogService.log(performedByUserId, null, "USER_STATUS_CHANGE", "USER",
                "Changed user status to " + newStatus + " for: " + saved.getFullName());

        return convertToDTO(saved);
    }

    @Transactional
    public void deleteUser(Long id, Long performedByUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        activityLogService.log(performedByUserId, null, "USER_DELETE", "USER",
                "Deleted user: " + user.getFullName() + " (" + user.getEmail() + ")");

        userRepository.delete(user);
    }

    public UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getRoleId());
            dto.setRoleName(user.getRole().getRoleName());
        }

        return dto;
    }
}