package com.CMS.service;

import com.CMS.dto.ActivityLogDTO;
import com.CMS.entity.ActivityLog;
import com.CMS.entity.Asset;
import com.CMS.entity.User;
import com.CMS.repository.ActivityLogRepository;
import com.CMS.repository.AssetRepository;
import com.CMS.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository,
                              UserRepository userRepository,
                              AssetRepository assetRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
    }

    @Transactional
    public ActivityLog log(Long userId, Long assetId, String action, String entityType, String details) {
        try {
            User user = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
            }
            if (user == null) {
                user = userRepository.findById(1L).orElse(null);
            }

            Asset asset = null;
            if (assetId != null) {
                asset = assetRepository.findById(assetId).orElse(null);
            }

            ActivityLog log = new ActivityLog(user, asset, action, entityType, details);
            return activityLogRepository.save(log);
        } catch (Exception e) {
            // Logging should never break main flow
            System.err.println("Failed to record activity log: " + e.getMessage());
            return null;
        }
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getAllActivities() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getRecentActivities(int limit) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .limit(limit)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDTO> filterActivities(String action, String entityType) {
        return activityLogRepository.filterLogs(action, entityType)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ActivityLogDTO convertToDTO(ActivityLog log) {
        ActivityLogDTO dto = new ActivityLogDTO();
        dto.setActivityId(log.getActivityId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setDetails(log.getDetails());
        dto.setCreatedAt(log.getCreatedAt());

        if (log.getUser() != null) {
            dto.setUserId(log.getUser().getUserId());
            dto.setUserName(log.getUser().getFullName());
            dto.setUserEmail(log.getUser().getEmail());
        }

        if (log.getAsset() != null) {
            dto.setAssetId(log.getAsset().getAssetId());
            dto.setAssetTitle(log.getAsset().getTitle());
        }

        return dto;
    }
}
