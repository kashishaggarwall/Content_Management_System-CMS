package com.CMS.dto;

import java.time.LocalDateTime;

public class TagDTO {
    private Long tagId;
    private String tagName;
    private long usageCount;
    private LocalDateTime createdAt;

    public TagDTO() {
    }

    public TagDTO(Long tagId, String tagName, long usageCount, LocalDateTime createdAt) {
        this.tagId = tagId;
        this.tagName = tagName;
        this.usageCount = usageCount;
        this.createdAt = createdAt;
    }

    public Long getTagId() {
        return tagId;
    }

    public void setTagId(Long tagId) {
        this.tagId = tagId;
    }

    public String getTagName() {
        return tagName;
    }

    public void setTagName(String tagName) {
        this.tagName = tagName;
    }

    public long getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(long usageCount) {
        this.usageCount = usageCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
