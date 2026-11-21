package com.CMS.controller;

import com.CMS.dto.ActivityLogDTO;
import com.CMS.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(originPatterns = "*")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLogDTO>> getAllActivities(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType) {

        if ((action != null && !action.isBlank()) || (entityType != null && !entityType.isBlank())) {
            return ResponseEntity.ok(activityLogService.filterActivities(
                    (action != null && !action.equalsIgnoreCase("ALL")) ? action : null,
                    (entityType != null && !entityType.equalsIgnoreCase("ALL")) ? entityType : null));
        }

        return ResponseEntity.ok(activityLogService.getAllActivities());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityLogDTO>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(activityLogService.getRecentActivities(limit));
    }
}
