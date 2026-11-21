package com.CMS.dto;

import java.time.LocalDateTime;

public class AssetVersionDTO {
    private Long versionId;
    private Long assetId;
    private String assetTitle;
    private String assetType;
    private Integer versionNumber;
    private String versionLabel; // e.g. "v1", "v2"
    private String filePath;
    private Long fileSizeBytes;
    private String formattedSize;
    private String changeNotes;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime createdAt;

    public AssetVersionDTO() {
    }

    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public String getAssetTitle() {
        return assetTitle;
    }

    public void setAssetTitle(String assetTitle) {
        this.assetTitle = assetTitle;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
        this.versionLabel = versionNumber != null ? "v" + versionNumber : null;
    }

    public String getVersionLabel() {
        return versionLabel;
    }

    public void setVersionLabel(String versionLabel) {
        this.versionLabel = versionLabel;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
        if (fileSizeBytes != null) {
            if (fileSizeBytes >= 1024 * 1024) {
                this.formattedSize = String.format("%.1f MB", fileSizeBytes / (1024.0 * 1024.0));
            } else if (fileSizeBytes >= 1024) {
                this.formattedSize = String.format("%.0f KB", fileSizeBytes / 1024.0);
            } else {
                this.formattedSize = fileSizeBytes + " B";
            }
        }
    }

    public String getFormattedSize() {
        return formattedSize;
    }

    public void setFormattedSize(String formattedSize) {
        this.formattedSize = formattedSize;
    }

    public String getChangeNotes() {
        return changeNotes;
    }

    public void setChangeNotes(String changeNotes) {
        this.changeNotes = changeNotes;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(Long uploadedById) {
        this.uploadedById = uploadedById;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
