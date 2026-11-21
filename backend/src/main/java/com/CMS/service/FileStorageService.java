package com.CMS.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path storageLocation;

    public FileStorageService() {
        // Resolve uploads/assets relative to project directory
        Path basePath = Paths.get("uploads", "assets").toAbsolutePath().normalize();
        // If running from project root and backend/uploads/assets exists, prefer backend/uploads/assets
        Path backendPath = Paths.get("backend", "uploads", "assets").toAbsolutePath().normalize();
        if (Files.exists(backendPath)) {
            this.storageLocation = backendPath;
        } else {
            this.storageLocation = basePath;
        }

        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + this.storageLocation, e);
        }
    }

    public Path getStorageLocation() {
        return storageLocation;
    }

    // Store uploaded file
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty file");
        }

        // Validate file size (max 50 MB)
        if (file.getSize() > 50L * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 50 MB");
        }

        try {
            String originalFileName = file.getOriginalFilename();
            String extension = "";

            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            }

            // Clean extension check
            if (extension.contains("/") || extension.contains("\\")) {
                throw new IllegalArgumentException("Invalid file extension");
            }

            String uniqueFileName = UUID.randomUUID() + extension;
            Path targetLocation = storageLocation.resolve(uniqueFileName).normalize();

            if (!targetLocation.startsWith(storageLocation)) {
                throw new IllegalArgumentException("Invalid file path / path traversal detected");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return targetLocation.toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    // Load file as Spring Resource for preview/download
    public Resource loadFileAsResource(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return null;
        }

        try {
            Path file = Paths.get(filePath).normalize();
            if (!file.isAbsolute()) {
                // If relative path, try resolving against storage location or current working dir
                if (filePath.startsWith("/uploads/assets/") || filePath.startsWith("uploads/assets/")) {
                    String fileName = Paths.get(filePath).getFileName().toString();
                    file = storageLocation.resolve(fileName).normalize();
                } else {
                    file = storageLocation.resolve(filePath).normalize();
                }
            }

            if (!Files.exists(file)) {
                // Also check storage location with just the file name
                Path fallback = storageLocation.resolve(Paths.get(filePath).getFileName().toString()).normalize();
                if (Files.exists(fallback)) {
                    file = fallback;
                }
            }

            if (Files.exists(file)) {
                Resource resource = new UrlResource(file.toUri());
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                }
            }
            return null;
        } catch (MalformedURLException e) {
            return null;
        }
    }

    // Delete stored file
    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return;
        }

        try {
            Path file = Paths.get(filePath).toAbsolutePath().normalize();
            if (file.startsWith(storageLocation)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException e) {
            System.err.println("Failed to delete stored file: " + filePath + " - " + e.getMessage());
        }
    }
}
