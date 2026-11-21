package com.CMS.service;

import com.CMS.dto.PermissionDTO;
import com.CMS.dto.RoleDTO;
import com.CMS.entity.Permission;
import com.CMS.entity.Role;
import com.CMS.repository.PermissionRepository;
import com.CMS.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final ActivityLogService activityLogService;

    public RoleService(RoleRepository roleRepository,
                       PermissionRepository permissionRepository,
                       ActivityLogService activityLogService) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAllWithPermissions()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDTO getRoleById(Long id) {
        return roleRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PermissionDTO> getAllPermissions() {
        return permissionRepository.findAll()
                .stream()
                .map(p -> new PermissionDTO(p.getPermissionId(), p.getPermissionKey(), p.getModuleName(), p.getDescription()))
                .collect(Collectors.toList());
    }

    @Transactional
    public RoleDTO updateRolePermissions(Long roleId, List<Long> permissionIds, Long performedByUserId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + roleId));

        Set<Permission> updatedPermissions = new HashSet<>();
        if (permissionIds != null && !permissionIds.isEmpty()) {
            updatedPermissions.addAll(permissionRepository.findAllById(permissionIds));
        }

        role.setPermissions(updatedPermissions);
        Role saved = roleRepository.save(role);

        activityLogService.log(performedByUserId, null, "ROLE_PERMISSIONS_UPDATE", "ROLE",
                "Updated permissions for role: " + role.getRoleName());

        return convertToDTO(saved);
    }

    public RoleDTO convertToDTO(Role role) {
        List<PermissionDTO> permissionDTOs = role.getPermissions() != null
                ? role.getPermissions().stream()
                .map(p -> new PermissionDTO(p.getPermissionId(), p.getPermissionKey(), p.getModuleName(), p.getDescription()))
                .collect(Collectors.toList())
                : List.of();

        return new RoleDTO(role.getRoleId(), role.getRoleName(), role.getDescription(), permissionDTOs);
    }
}
