package com.CMS.service;

import com.CMS.dto.ActivityLogDTO;
import com.CMS.dto.AssetResponseDTO;
import com.CMS.dto.DashboardStatsDTO;
import com.CMS.repository.AssetRepository;
import com.CMS.repository.CategoryRepository;
import com.CMS.repository.TagRepository;
import com.CMS.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final AssetService assetService;
    private final ActivityLogService activityLogService;

    public DashboardService(AssetRepository assetRepository,
                            CategoryRepository categoryRepository,
                            TagRepository tagRepository,
                            UserRepository userRepository,
                            AssetService assetService,
                            ActivityLogService activityLogService) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
        this.assetService = assetService;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalAssets(assetRepository.count());
        stats.setPublishedAssets(assetRepository.countByStatus("PUBLISHED"));
        stats.setDraftAssets(assetRepository.countByStatus("DRAFT"));
        stats.setArchivedAssets(assetRepository.countByStatus("ARCHIVED"));

        stats.setTotalCategories(categoryRepository.count());
        stats.setTotalTags(tagRepository.count());
        stats.setTotalUsers(userRepository.count());

        List<AssetResponseDTO> recentAssets = assetRepository.findRecentAssets()
                .stream()
                .limit(5)
                .map(assetService::convertToDTO)
                .collect(Collectors.toList());
        stats.setRecentAssets(recentAssets);

        List<ActivityLogDTO> recentActivities = activityLogService.getRecentActivities(5);
        stats.setRecentActivities(recentActivities);

        return stats;
    }
}
