package com.CMS.service;

import com.CMS.dto.AssetResponseDTO;
import com.CMS.dto.AssetUploadDTO;
import com.CMS.entity.Asset;
import com.CMS.entity.Category;
import com.CMS.entity.Tag;
import com.CMS.entity.User;
import com.CMS.repository.AssetRepository;
import com.CMS.repository.CategoryRepository;
import com.CMS.repository.TagRepository;
import com.CMS.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final AssetVersionService assetVersionService;
    private final ActivityLogService activityLogService;

    public AssetService(AssetRepository assetRepository,
                        CategoryRepository categoryRepository,
                        TagRepository tagRepository,
                        UserRepository userRepository,
                        FileStorageService fileStorageService,
                        AssetVersionService assetVersionService,
                        ActivityLogService activityLogService) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.assetVersionService = assetVersionService;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<AssetResponseDTO> getAllAssets() {
        return assetRepository.findAllWithRelations()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssetResponseDTO getAssetById(Long id) {
        return assetRepository.findByIdWithRelations(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<AssetResponseDTO> searchAssets(String query, Long categoryId, String assetType, String status) {
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        String cleanType = (assetType != null && !assetType.equalsIgnoreCase("ALL") && !assetType.equalsIgnoreCase("All Types"))
                ? normalizeAssetType(assetType) : null;
        String cleanStatus = (status != null && !status.equalsIgnoreCase("ALL") && !status.equalsIgnoreCase("All Status"))
                ? status.toUpperCase() : null;

        return assetRepository.searchAssets(cleanQuery, categoryId, cleanType, cleanStatus)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssetResponseDTO createAsset(AssetUploadDTO uploadDto, MultipartFile file, Long currentUserId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Physical file is required for asset upload");
        }
        if (uploadDto.getTitle() == null || uploadDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Asset title is required");
        }

        // Determine creator
        Long creatorId = currentUserId != null ? currentUserId : uploadDto.getCreatedById();
        if (creatorId == null) {
            creatorId = 1L; // Fallback to Admin (user 1)
        }
        User creator = userRepository.findById(creatorId)
                .orElseGet(() -> userRepository.findById(1L)
                        .orElseThrow(() -> new RuntimeException("Creator user not found")));

        // Normalize Asset Type and Status to satisfy MySQL check constraints
        String mimeType = file.getContentType();
        String assetType = determineAssetType(uploadDto.getAssetType(), mimeType, file.getOriginalFilename());
        String status = uploadDto.getStatus() != null && !uploadDto.getStatus().isBlank()
                ? uploadDto.getStatus().toUpperCase()
                : "DRAFT";
        if (!List.of("DRAFT", "PUBLISHED", "ARCHIVED").contains(status)) {
            status = "DRAFT";
        }

        // Category
        Category category = null;
        if (uploadDto.getCategoryId() != null) {
            category = categoryRepository.findById(uploadDto.getCategoryId()).orElse(null);
        }

        // Store physical file
        String filePath = fileStorageService.storeFile(file);

        Asset asset = new Asset();
        asset.setTitle(uploadDto.getTitle().trim());
        asset.setDescription(uploadDto.getDescription() != null ? uploadDto.getDescription().trim() : null);
        asset.setAssetType(assetType);
        asset.setStatus(status);
        asset.setCategory(category);
        asset.setCreatedBy(creator);
        asset.setFileName(file.getOriginalFilename());
        asset.setFilePath(filePath);
        asset.setFileSizeBytes(file.getSize());
        asset.setMimeType(mimeType != null && mimeType.length() <= 100 ? mimeType : "application/octet-stream");

        // Associate tags
        if (uploadDto.getTags() != null && !uploadDto.getTags().isEmpty()) {
            Set<Tag> tagEntities = resolveTags(uploadDto.getTags());
            asset.setTags(tagEntities);
        }

        Asset saved = assetRepository.save(asset);

        // Record initial version in asset_versions
        try {
            assetVersionService.createVersion(saved.getAssetId(), creator.getUserId(), filePath, file.getSize(), "Initial version uploaded");
        } catch (Exception e) {
            System.err.println("Could not create version record: " + e.getMessage());
        }

        // Record activity log
        activityLogService.log(creator.getUserId(), saved.getAssetId(), "ASSET_UPLOAD", "ASSET",
                "Uploaded asset: " + saved.getTitle() + " (" + assetType + ", " + saved.getFileName() + ")");

        return convertToDTO(saved);
    }

    @Transactional
    public AssetResponseDTO updateAsset(Long id, AssetUploadDTO uploadDto, MultipartFile file, Long currentUserId) {
        Asset existing = assetRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with ID: " + id));

        if (uploadDto.getTitle() != null && !uploadDto.getTitle().isBlank()) {
            existing.setTitle(uploadDto.getTitle().trim());
        }

        if (uploadDto.getDescription() != null) {
            existing.setDescription(uploadDto.getDescription().trim());
        }

        if (uploadDto.getAssetType() != null && !uploadDto.getAssetType().isBlank()) {
            existing.setAssetType(normalizeAssetType(uploadDto.getAssetType()));
        }

        if (uploadDto.getStatus() != null && !uploadDto.getStatus().isBlank()) {
            String s = uploadDto.getStatus().toUpperCase();
            if (List.of("DRAFT", "PUBLISHED", "ARCHIVED").contains(s)) {
                existing.setStatus(s);
            }
        }

        if (uploadDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(uploadDto.getCategoryId()).orElse(null);
            existing.setCategory(category);
        }

        if (uploadDto.getTags() != null) {
            Set<Tag> tagEntities = resolveTags(uploadDto.getTags());
            existing.setTags(tagEntities);
        }

        // If file is replaced
        if (file != null && !file.isEmpty()) {
            String newFilePath = fileStorageService.storeFile(file);
            existing.setFilePath(newFilePath);
            existing.setFileName(file.getOriginalFilename());
            existing.setFileSizeBytes(file.getSize());
            String mime = file.getContentType();
            existing.setMimeType(mime != null && mime.length() <= 100 ? mime : "application/octet-stream");

            // Record new version
            Long uploaderId = currentUserId != null ? currentUserId : (existing.getCreatedBy() != null ? existing.getCreatedBy().getUserId() : 1L);
            assetVersionService.createVersion(existing.getAssetId(), uploaderId, newFilePath, file.getSize(), "Replaced asset file: " + file.getOriginalFilename());
        }

        Asset saved = assetRepository.save(existing);

        Long actorId = currentUserId != null ? currentUserId : (existing.getCreatedBy() != null ? existing.getCreatedBy().getUserId() : 1L);
        activityLogService.log(actorId, saved.getAssetId(), "ASSET_UPDATE", "ASSET",
                "Updated asset metadata: " + saved.getTitle());

        return convertToDTO(saved);
    }

    @Transactional
    public void deleteAsset(Long id, Long currentUserId) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with ID: " + id));

        String title = asset.getTitle();
        String filePath = asset.getFilePath();

        // Delete database record (cascades to asset_tags, asset_versions, asset_permissions per schema.sql)
        assetRepository.delete(asset);

        // Delete physical file
        fileStorageService.deleteFile(filePath);

        activityLogService.log(currentUserId != null ? currentUserId : 1L, null, "ASSET_DELETE", "ASSET",
                "Deleted asset: " + title);
    }

    public Resource loadFileAsResource(Long id) {
        Asset asset = assetRepository.findById(id).orElse(null);
        if (asset == null || asset.getFilePath() == null) {
            return null;
        }
        return fileStorageService.loadFileAsResource(asset.getFilePath());
    }

    private Set<Tag> resolveTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        for (String raw : tagNames) {
            if (raw == null || raw.isBlank()) continue;
            String name = raw.trim().replace("#", "");
            if (name.isBlank()) continue;

            Tag tag = tagRepository.findByTagName(name)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setTagName(name);
                        return tagRepository.save(newTag);
                    });
            tags.add(tag);
        }
        return tags;
    }

    private String determineAssetType(String requestedType, String mimeType, String fileName) {
        if (requestedType != null && !requestedType.isBlank()) {
            String norm = normalizeAssetType(requestedType);
            if (norm != null) return norm;
        }

        if (mimeType != null) {
            String m = mimeType.toLowerCase();
            if (m.startsWith("image/")) return "IMAGE";
            if (m.startsWith("video/")) return "VIDEO";
            if (m.startsWith("audio/")) return "AUDIO";
        }

        if (fileName != null) {
            String fn = fileName.toLowerCase();
            if (fn.endsWith(".jpg") || fn.endsWith(".jpeg") || fn.endsWith(".png") || fn.endsWith(".gif") || fn.endsWith(".webp") || fn.endsWith(".svg")) {
                return "IMAGE";
            }
            if (fn.endsWith(".mp4") || fn.endsWith(".mov") || fn.endsWith(".avi") || fn.endsWith(".mkv") || fn.endsWith(".webm")) {
                return "VIDEO";
            }
            if (fn.endsWith(".mp3") || fn.endsWith(".wav") || fn.endsWith(".ogg") || fn.endsWith(".m4a")) {
                return "AUDIO";
            }
        }

        return "IMAGE"; // Default safe fallback for schema constraint
    }

    private String normalizeAssetType(String type) {
        if (type == null) return null;
        String upper = type.toUpperCase().trim();
        if (upper.equals("IMAGE") || upper.equals("IMAGES")) return "IMAGE";
        if (upper.equals("VIDEO") || upper.equals("VIDEOS")) return "VIDEO";
        if (upper.equals("AUDIO")) return "AUDIO";
        // If document is requested, schema check constraint only allows IMAGE, VIDEO, AUDIO
        return "IMAGE";
    }

    public AssetResponseDTO convertToDTO(Asset asset) {
        AssetResponseDTO dto = new AssetResponseDTO();
        dto.setAssetId(asset.getAssetId());
        dto.setTitle(asset.getTitle());
        dto.setDescription(asset.getDescription());
        dto.setAssetType(asset.getAssetType());
        dto.setFileName(asset.getFileName());
        dto.setFilePath(asset.getFilePath());
        dto.setMimeType(asset.getMimeType());
        dto.setFileSizeBytes(asset.getFileSizeBytes());
        dto.setStatus(asset.getStatus());
        dto.setCreatedAt(asset.getCreatedAt());
        dto.setUpdatedAt(asset.getUpdatedAt());

        dto.setPreviewUrl("/api/assets/" + asset.getAssetId() + "/preview");
        dto.setDownloadUrl("/api/assets/" + asset.getAssetId() + "/download");

        if (asset.getCategory() != null) {
            dto.setCategoryId(asset.getCategory().getCategoryId());
            dto.setCategoryName(asset.getCategory().getCategoryName());
        } else {
            dto.setCategoryName("Uncategorized");
        }

        if (asset.getCreatedBy() != null) {
            dto.setCreatedById(asset.getCreatedBy().getUserId());
            dto.setCreatedByName(asset.getCreatedBy().getFullName());
            if (asset.getCreatedBy().getRole() != null) {
                dto.setCreatedByRole(asset.getCreatedBy().getRole().getRoleName());
            }
        }

        if (asset.getTags() != null) {
            dto.setTags(asset.getTags().stream().map(Tag::getTagName).collect(Collectors.toList()));
        } else {
            dto.setTags(Collections.emptyList());
        }

        return dto;
    }
}