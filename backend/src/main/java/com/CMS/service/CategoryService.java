package com.CMS.service;

import com.CMS.dto.CategoryDTO;
import com.CMS.entity.Category;
import com.CMS.repository.AssetRepository;
import com.CMS.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AssetRepository assetRepository;
    private final ActivityLogService activityLogService;

    public CategoryService(CategoryRepository categoryRepository,
                           AssetRepository assetRepository,
                           ActivityLogService activityLogService) {
        this.categoryRepository = categoryRepository;
        this.assetRepository = assetRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional
    public CategoryDTO createCategory(Category category, Long performedByUserId) {
        if (category.getCategoryName() == null || category.getCategoryName().isBlank()) {
            throw new IllegalArgumentException("Category name is required");
        }

        String name = category.getCategoryName().trim();
        if (categoryRepository.existsByCategoryName(name)) {
            throw new IllegalArgumentException("A category with this name already exists: " + name);
        }

        category.setCategoryName(name);
        category.setDescription(category.getDescription() != null ? category.getDescription().trim() : null);

        Category saved = categoryRepository.save(category);

        activityLogService.log(performedByUserId, null, "CATEGORY_CREATE", "CATEGORY",
                "Created category: " + saved.getCategoryName());

        return convertToDTO(saved);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, Category updated, Long performedByUserId) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

        if (updated.getCategoryName() != null && !updated.getCategoryName().isBlank()) {
            String name = updated.getCategoryName().trim();
            if (categoryRepository.existsByCategoryNameAndCategoryIdNot(name, id)) {
                throw new IllegalArgumentException("A category with this name already exists: " + name);
            }
            existing.setCategoryName(name);
        }

        if (updated.getDescription() != null) {
            existing.setDescription(updated.getDescription().trim());
        }

        Category saved = categoryRepository.save(existing);

        activityLogService.log(performedByUserId, null, "CATEGORY_UPDATE", "CATEGORY",
                "Updated category: " + saved.getCategoryName());

        return convertToDTO(saved);
    }

    @Transactional
    public void deleteCategory(Long id, Long performedByUserId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

        long assetCount = assetRepository.countByCategoryCategoryId(id);
        if (assetCount > 0) {
            throw new IllegalStateException("Cannot delete category '" + category.getCategoryName() +
                    "' because it contains " + assetCount + " asset(s). Reassign or delete them first.");
        }

        activityLogService.log(performedByUserId, null, "CATEGORY_DELETE", "CATEGORY",
                "Deleted category: " + category.getCategoryName());

        categoryRepository.delete(category);
    }

    public CategoryDTO convertToDTO(Category category) {
        long count = assetRepository.countByCategoryCategoryId(category.getCategoryId());
        return new CategoryDTO(
                category.getCategoryId(),
                category.getCategoryName(),
                category.getDescription(),
                count,
                category.getCreatedAt()
        );
    }
}