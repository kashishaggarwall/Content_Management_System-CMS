package com.CMS.service;

import com.CMS.dto.AssetVersionDTO;
import com.CMS.entity.Asset;
import com.CMS.entity.AssetVersion;
import com.CMS.entity.User;
import com.CMS.repository.AssetRepository;
import com.CMS.repository.AssetVersionRepository;
import com.CMS.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetVersionService {

    private final AssetVersionRepository assetVersionRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    public AssetVersionService(AssetVersionRepository assetVersionRepository,
                               AssetRepository assetRepository,
                               UserRepository userRepository) {
        this.assetVersionRepository = assetVersionRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AssetVersionDTO> getAllVersions() {
        return assetVersionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssetVersionDTO> getVersionsByAssetId(Long assetId) {
        return assetVersionRepository.findByAssetAssetIdOrderByVersionNumberDesc(assetId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssetVersion createVersion(Long assetId, Long uploaderId, String filePath, Long fileSizeBytes, String changeNotes) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found with ID: " + assetId));

        User uploader = null;
        if (uploaderId != null) {
            uploader = userRepository.findById(uploaderId).orElse(null);
        }
        if (uploader == null) {
            uploader = asset.getCreatedBy();
        }
        if (uploader == null) {
            uploader = userRepository.findById(1L).orElseThrow(() -> new RuntimeException("Default user not found"));
        }

        Integer currentMax = assetVersionRepository.findMaxVersionNumberByAssetId(assetId);
        int nextVersion = (currentMax != null ? currentMax : 0) + 1;

        AssetVersion version = new AssetVersion();
        version.setAsset(asset);
        version.setVersionNumber(nextVersion);
        version.setFilePath(filePath);
        version.setFileSizeBytes(fileSizeBytes);
        version.setChangeNotes(changeNotes != null && !changeNotes.isBlank() ? changeNotes : "Version " + nextVersion + " update");
        version.setUploadedBy(uploader);

        return assetVersionRepository.save(version);
    }

    public AssetVersionDTO convertToDTO(AssetVersion version) {
        AssetVersionDTO dto = new AssetVersionDTO();
        dto.setVersionId(version.getVersionId());
        dto.setVersionNumber(version.getVersionNumber());
        dto.setFilePath(version.getFilePath());
        dto.setFileSizeBytes(version.getFileSizeBytes());
        dto.setChangeNotes(version.getChangeNotes());
        dto.setCreatedAt(version.getCreatedAt());

        if (version.getAsset() != null) {
            dto.setAssetId(version.getAsset().getAssetId());
            dto.setAssetTitle(version.getAsset().getTitle());
            dto.setAssetType(version.getAsset().getAssetType());
        }

        if (version.getUploadedBy() != null) {
            dto.setUploadedById(version.getUploadedBy().getUserId());
            dto.setUploadedByName(version.getUploadedBy().getFullName());
        }

        return dto;
    }
}
