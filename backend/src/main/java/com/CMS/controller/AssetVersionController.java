package com.CMS.controller;

import com.CMS.dto.AssetVersionDTO;
import com.CMS.service.AssetVersionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versions")
@CrossOrigin(originPatterns = "*")
public class AssetVersionController {

    private final AssetVersionService assetVersionService;

    public AssetVersionController(AssetVersionService assetVersionService) {
        this.assetVersionService = assetVersionService;
    }

    @GetMapping
    public ResponseEntity<List<AssetVersionDTO>> getAllVersions() {
        return ResponseEntity.ok(assetVersionService.getAllVersions());
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<AssetVersionDTO>> getVersionsByAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(assetVersionService.getVersionsByAssetId(assetId));
    }
}
