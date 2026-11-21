package com.CMS.dto;

import java.util.List;

public class RoleDTO {
    private Long roleId;
    private String roleName;
    private String description;
    private List<PermissionDTO> permissions;

    public RoleDTO() {
    }

    public RoleDTO(Long roleId, String roleName, String description, List<PermissionDTO> permissions) {
        this.roleId = roleId;
        this.roleName = roleName;
        this.description = description;
        this.permissions = permissions;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<PermissionDTO> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<PermissionDTO> permissions) {
        this.permissions = permissions;
    }
}
