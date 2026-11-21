package com.CMS.dto;

public class PermissionDTO {
    private Long permissionId;
    private String permissionKey;
    private String moduleName;
    private String description;

    public PermissionDTO() {
    }

    public PermissionDTO(Long permissionId, String permissionKey, String moduleName, String description) {
        this.permissionId = permissionId;
        this.permissionKey = permissionKey;
        this.moduleName = moduleName;
        this.description = description;
    }

    public Long getPermissionId() {
        return permissionId;
    }

    public void setPermissionId(Long permissionId) {
        this.permissionId = permissionId;
    }

    public String getPermissionKey() {
        return permissionKey;
    }

    public void setPermissionKey(String permissionKey) {
        this.permissionKey = permissionKey;
    }

    public String getModuleName() {
        return moduleName;
    }

    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
