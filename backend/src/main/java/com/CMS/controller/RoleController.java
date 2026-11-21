package com.CMS.controller;

import com.CMS.dto.PermissionDTO;
import com.CMS.dto.RoleDTO;
import com.CMS.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(originPatterns = "*")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        RoleDTO role = roleService.getRoleById(id);
        if (role == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(role);
    }

    @GetMapping("/permissions")
    public ResponseEntity<List<PermissionDTO>> getAllPermissions() {
        return ResponseEntity.ok(roleService.getAllPermissions());
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<RoleDTO> updateRolePermissions(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        List<Long> permissionIds = request.get("permissionIds");
        RoleDTO updated = roleService.updateRolePermissions(id, permissionIds, userId);
        return ResponseEntity.ok(updated);
    }
}
