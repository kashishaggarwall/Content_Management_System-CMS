package com.CMS.controller;

import com.CMS.dto.AssetResponseDTO;
import com.CMS.dto.AssetUploadDTO;
import com.CMS.service.AssetService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(originPatterns = "*")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    // Get all assets with optional search & filters
    @GetMapping
    public ResponseEntity<List<AssetResponseDTO>> getAllAssets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {

        if ((search != null && !search.isBlank()) ||
            categoryId != null ||
            (type != null && !type.isBlank()) ||
            (status != null && !status.isBlank())) {
            return ResponseEntity.ok(assetService.searchAssets(search, categoryId, type, status));
        }

        return ResponseEntity.ok(assetService.getAllAssets());
    }

    // Get asset by ID
    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> getAssetById(@PathVariable Long id) {
        AssetResponseDTO asset = assetService.getAssetById(id);
        if (asset == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(asset);
    }

    // Create asset with file upload (Accepts AssetUploadDTO part or individual form fields)
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAsset(
            @RequestPart(value = "asset", required = false) AssetUploadDTO assetDto,
            @RequestParam(value = "title", required = false) String paramTitle,
            @RequestParam(value = "description", required = false) String paramDescription,
            @RequestParam(value = "assetType", required = false) String paramAssetType,
            @RequestParam(value = "categoryId", required = false) Long paramCategoryId,
            @RequestParam(value = "status", required = false) String paramStatus,
            @RequestParam(value = "tags", required = false) String paramTags,
            @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        try {
            AssetUploadDTO uploadDTO = assetDto != null ? assetDto : new AssetUploadDTO();
            if (uploadDTO.getTitle() == null && paramTitle != null) {
                uploadDTO.setTitle(paramTitle);
            }
            if (uploadDTO.getDescription() == null && paramDescription != null) {
                uploadDTO.setDescription(paramDescription);
            }
            if (uploadDTO.getAssetType() == null && paramAssetType != null) {
                uploadDTO.setAssetType(paramAssetType);
            }
            if (uploadDTO.getCategoryId() == null && paramCategoryId != null) {
                uploadDTO.setCategoryId(paramCategoryId);
            }
            if (uploadDTO.getStatus() == null && paramStatus != null) {
                uploadDTO.setStatus(paramStatus);
            }
            if (uploadDTO.getTags() == null && paramTags != null && !paramTags.isBlank()) {
                uploadDTO.setTags(Arrays.asList(paramTags.split(",")));
            }

            AssetResponseDTO created = assetService.createAsset(uploadDTO, file, currentUserId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // 1. Update asset metadata using JSON (No physical file replacement)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateAssetJson(
            @PathVariable Long id,
            @RequestBody AssetUploadDTO bodyDto,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        try {
            AssetResponseDTO updated = assetService.updateAsset(id, bodyDto, null, currentUserId);
            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 2. Update asset using Multipart (Supports individual form fields and optional physical file replacement)
    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE})
    public ResponseEntity<?> updateAssetMultipart(
            @PathVariable Long id,
            @RequestPart(value = "asset", required = false) AssetUploadDTO assetPart,
            @RequestParam(value = "title", required = false) String paramTitle,
            @RequestParam(value = "description", required = false) String paramDescription,
            @RequestParam(value = "assetType", required = false) String paramAssetType,
            @RequestParam(value = "categoryId", required = false) Long paramCategoryId,
            @RequestParam(value = "status", required = false) String paramStatus,
            @RequestParam(value = "tags", required = false) String paramTags,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        try {
            AssetUploadDTO uploadDTO = assetPart != null ? assetPart : new AssetUploadDTO();
            if (uploadDTO.getTitle() == null && paramTitle != null) {
                uploadDTO.setTitle(paramTitle);
            }
            if (uploadDTO.getDescription() == null && paramDescription != null) {
                uploadDTO.setDescription(paramDescription);
            }
            if (uploadDTO.getAssetType() == null && paramAssetType != null) {
                uploadDTO.setAssetType(paramAssetType);
            }
            if (uploadDTO.getCategoryId() == null && paramCategoryId != null) {
                uploadDTO.setCategoryId(paramCategoryId);
            }
            if (uploadDTO.getStatus() == null && paramStatus != null) {
                uploadDTO.setStatus(paramStatus);
            }
            if (uploadDTO.getTags() == null && paramTags != null && !paramTags.isBlank()) {
                uploadDTO.setTags(Arrays.stream(paramTags.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList()));
            }

            AssetResponseDTO updated = assetService.updateAsset(id, uploadDTO, file, currentUserId);
            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Delete asset
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        try {
            assetService.deleteAsset(id, currentUserId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Preview / stream asset file
    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewAsset(@PathVariable Long id) {
        AssetResponseDTO asset = assetService.getAssetById(id);
        if (asset == null) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = assetService.loadFileAsResource(id);

        if (resource == null || !resource.exists()) {
            // Return generated SVG placeholder for demo/seed records where physical file is not on disk
            String svg = generatePlaceholderSvg(asset.getTitle(), asset.getAssetType(), asset.getCategoryName());
            ByteArrayResource svgResource = new ByteArrayResource(svg.getBytes(StandardCharsets.UTF_8));
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("image/svg+xml"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"placeholder.svg\"")
                    .body(svgResource);
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (asset.getMimeType() != null) {
            try {
                mediaType = MediaType.parseMediaType(asset.getMimeType());
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + asset.getFileName() + "\"")
                .body(resource);
    }

    // Download original asset file
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadAsset(@PathVariable Long id) {
        AssetResponseDTO asset = assetService.getAssetById(id);
        if (asset == null) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = assetService.loadFileAsResource(id);

        if (resource == null || !resource.exists()) {
            // Fallback text file with metadata if original file is absent on disk
            String content = "CMS Asset Metadata\n" +
                    "Title: " + asset.getTitle() + "\n" +
                    "Type: " + asset.getAssetType() + "\n" +
                    "Category: " + asset.getCategoryName() + "\n" +
                    "Created: " + asset.getCreatedAt();
            ByteArrayResource textResource = new ByteArrayResource(content.getBytes(StandardCharsets.UTF_8));
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + asset.getFileName() + ".txt\"")
                    .body(textResource);
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (asset.getMimeType() != null) {
            try {
                mediaType = MediaType.parseMediaType(asset.getMimeType());
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + asset.getFileName() + "\"")
                .body(resource);
    }

    private String generatePlaceholderSvg(String title, String type, String category) {
        String cleanTitle = title != null ? title.replaceAll("[<>&]", "") : "CMS Asset";
        if (cleanTitle.length() > 30) cleanTitle = cleanTitle.substring(0, 27) + "...";
        String color1 = "#6366f1";
        String color2 = "#4338ca";
        String icon = "🖼️";

        if ("VIDEO".equalsIgnoreCase(type)) {
            color1 = "#f97316";
            color2 = "#c2410c";
            icon = "🎬";
        } else if ("AUDIO".equalsIgnoreCase(type)) {
            color1 = "#10b981";
            color2 = "#047857";
            icon = "🎧";
        }

        return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"250\" viewBox=\"0 0 400 250\">" +
                "<defs><linearGradient id=\"g\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">" +
                "<stop offset=\"0%\" stop-color=\"" + color1 + "\" />" +
                "<stop offset=\"100%\" stop-color=\"" + color2 + "\" />" +
                "</linearGradient></defs>" +
                "<rect width=\"400\" height=\"250\" fill=\"url(#g)\" rx=\"8\" />" +
                "<text x=\"200\" y=\"95\" font-size=\"42\" text-anchor=\"middle\" fill=\"#ffffff\">" + icon + "</text>" +
                "<text x=\"200\" y=\"145\" font-family=\"sans-serif\" font-size=\"16\" font-weight=\"bold\" text-anchor=\"middle\" fill=\"#ffffff\">" + cleanTitle + "</text>" +
                "<text x=\"200\" y=\"175\" font-family=\"sans-serif\" font-size=\"13\" text-anchor=\"middle\" fill=\"rgba(255,255,255,0.8)\">" + (category != null ? category : "Digital Asset") + "</text>" +
                "</svg>";
    }
}
