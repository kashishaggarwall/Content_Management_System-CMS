package com.CMS.repository;

import com.CMS.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    @Query("SELECT DISTINCT a FROM Asset a " +
           "LEFT JOIN FETCH a.category " +
           "LEFT JOIN FETCH a.createdBy u " +
           "LEFT JOIN FETCH u.role " +
           "LEFT JOIN FETCH a.tags " +
           "ORDER BY a.createdAt DESC")
    List<Asset> findAllWithRelations();

    @Query("SELECT DISTINCT a FROM Asset a " +
           "LEFT JOIN FETCH a.category " +
           "LEFT JOIN FETCH a.createdBy u " +
           "LEFT JOIN FETCH u.role " +
           "LEFT JOIN FETCH a.tags " +
           "WHERE a.assetId = :id")
    Optional<Asset> findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT DISTINCT a FROM Asset a " +
           "LEFT JOIN FETCH a.category " +
           "LEFT JOIN FETCH a.createdBy u " +
           "LEFT JOIN FETCH u.role " +
           "LEFT JOIN FETCH a.tags " +
           "WHERE (:query IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:categoryId IS NULL OR a.category.categoryId = :categoryId) " +
           "AND (:assetType IS NULL OR a.assetType = :assetType) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "ORDER BY a.createdAt DESC")
    List<Asset> searchAssets(@Param("query") String query,
                             @Param("categoryId") Long categoryId,
                             @Param("assetType") String assetType,
                             @Param("status") String status);

    long countByCategoryCategoryId(Long categoryId);

    long countByTagsTagId(Long tagId);

    long countByStatus(String status);

    long countByAssetType(String assetType);

    @Query("SELECT DISTINCT a FROM Asset a " +
           "LEFT JOIN FETCH a.category " +
           "LEFT JOIN FETCH a.createdBy u " +
           "LEFT JOIN FETCH u.role " +
           "ORDER BY a.createdAt DESC")
    List<Asset> findRecentAssets();
}
