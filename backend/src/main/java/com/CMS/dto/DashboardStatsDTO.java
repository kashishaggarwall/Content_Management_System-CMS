package com.CMS.dto;

import java.util.List;

public class DashboardStatsDTO {
    private long totalAssets;
    private long publishedAssets;
    private long draftAssets;
    private long archivedAssets;
    private long totalCategories;
    private long totalTags;
    private long totalUsers;
    private List<AssetResponseDTO> recentAssets;
    private List<ActivityLogDTO> recentActivities;

    public DashboardStatsDTO() {
    }

    public long getTotalAssets() {
        return totalAssets;
    }

    public void setTotalAssets(long totalAssets) {
        this.totalAssets = totalAssets;
    }

    public long getPublishedAssets() {
        return publishedAssets;
    }

    public void setPublishedAssets(long publishedAssets) {
        this.publishedAssets = publishedAssets;
    }

    public long getDraftAssets() {
        return draftAssets;
    }

    public void setDraftAssets(long draftAssets) {
        this.draftAssets = draftAssets;
    }

    public long getArchivedAssets() {
        return archivedAssets;
    }

    public void setArchivedAssets(long archivedAssets) {
        this.archivedAssets = archivedAssets;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getTotalTags() {
        return totalTags;
    }

    public void setTotalTags(long totalTags) {
        this.totalTags = totalTags;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public List<AssetResponseDTO> getRecentAssets() {
        return recentAssets;
    }

    public void setRecentAssets(List<AssetResponseDTO> recentAssets) {
        this.recentAssets = recentAssets;
    }

    public List<ActivityLogDTO> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<ActivityLogDTO> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
