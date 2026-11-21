package com.CMS.service;

import com.CMS.dto.TagDTO;
import com.CMS.entity.Tag;
import com.CMS.repository.AssetRepository;
import com.CMS.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagService {

    private final TagRepository tagRepository;
    private final AssetRepository assetRepository;
    private final ActivityLogService activityLogService;

    public TagService(TagRepository tagRepository,
                      AssetRepository assetRepository,
                      ActivityLogService activityLogService) {
        this.tagRepository = tagRepository;
        this.assetRepository = assetRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<TagDTO> getAllTags() {
        return tagRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TagDTO getTagById(Long id) {
        return tagRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional
    public TagDTO createTag(Tag tag, Long performedByUserId) {
        if (tag.getTagName() == null || tag.getTagName().isBlank()) {
            throw new IllegalArgumentException("Tag name is required");
        }

        String name = tag.getTagName().trim();
        if (tagRepository.existsByTagName(name)) {
            throw new IllegalArgumentException("A tag with this name already exists: " + name);
        }

        tag.setTagName(name);
        Tag saved = tagRepository.save(tag);

        activityLogService.log(performedByUserId, null, "TAG_CREATE", "TAG",
                "Created tag: #" + saved.getTagName());

        return convertToDTO(saved);
    }

    @Transactional
    public TagDTO updateTag(Long id, Tag updated, Long performedByUserId) {
        Tag existing = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with ID: " + id));

        if (updated.getTagName() != null && !updated.getTagName().isBlank()) {
            String name = updated.getTagName().trim();
            if (tagRepository.existsByTagNameAndTagIdNot(name, id)) {
                throw new IllegalArgumentException("A tag with this name already exists: " + name);
            }
            existing.setTagName(name);
        }

        Tag saved = tagRepository.save(existing);

        activityLogService.log(performedByUserId, null, "TAG_UPDATE", "TAG",
                "Updated tag to: #" + saved.getTagName());

        return convertToDTO(saved);
    }

    @Transactional
    public void deleteTag(Long id, Long performedByUserId) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with ID: " + id));

        long usage = assetRepository.countByTagsTagId(id);
        if (usage > 0) {
            throw new IllegalStateException("Cannot delete tag '" + tag.getTagName() +
                    "' because it is used by " + usage + " asset(s). Remove it from assets first.");
        }

        activityLogService.log(performedByUserId, null, "TAG_DELETE", "TAG",
                "Deleted tag: #" + tag.getTagName());

        tagRepository.delete(tag);
    }

    public TagDTO convertToDTO(Tag tag) {
        long usage = assetRepository.countByTagsTagId(tag.getTagId());
        return new TagDTO(
                tag.getTagId(),
                tag.getTagName(),
                usage,
                tag.getCreatedAt()
        );
    }
}