package com.CMS.security;

import org.mindrot.jbcrypt.BCrypt;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class PasswordUtil {

    public static String hashPassword(String plaintext) {
        if (plaintext == null || plaintext.isBlank()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        return BCrypt.hashpw(plaintext, BCrypt.gensalt(10));
    }

    public static boolean verifyPassword(String plaintext, String storedHash) {
        if (plaintext == null || storedHash == null) {
            return false;
        }

        // If BCrypt hash
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            try {
                return BCrypt.checkpw(plaintext, storedHash);
            } catch (Exception e) {
                return false;
            }
        }

        // If legacy SHA-256 hash (as used in seed_data.sql via SHA2('CMS_DEMO_PASSWORD', 256))
        String sha256Hex = sha256Hex(plaintext);
        return sha256Hex.equalsIgnoreCase(storedHash);
    }

    public static boolean isLegacySha256(String storedHash) {
        return storedHash != null && storedHash.length() == 64 && !storedHash.startsWith("$2");
    }

    private static String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
