package com.CMS.repository;

import com.CMS.entity.AssetVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssetVersionRepository extends JpaRepository<AssetVersion, Long> {

    List<AssetVersion> findByAssetAssetIdOrderByVersionNumberDesc(Long assetId);

    @Query("SELECT COALESCE(MAX(v.versionNumber), 0) FROM AssetVersion v WHERE v.asset.assetId = :assetId")
    Integer findMaxVersionNumberByAssetId(@Param("assetId") Long assetId);

    List<AssetVersion> findAllByOrderByCreatedAtDesc();
}
