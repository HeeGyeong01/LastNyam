package com.lastnyam.owner.external.s3.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * S3 파일명 생성 유틸리티
 *
 * 고유한 파일명을 생성하여 파일명 충돌을 방지합니다.
 */
public class S3FileNameGenerator {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    /**
     * 고유한 파일명 생성
     *
     * 형식: {timestamp}_{UUID}_{originalFileName}
     * 예시: 20250129_143052_a1b2c3d4_sample.jpg
     *
     * @param originalFileName 원본 파일명
     * @return 고유한 파일명
     */
    public static String generate(String originalFileName) {
        if (originalFileName == null || originalFileName.trim().isEmpty()) {
            throw new IllegalArgumentException("파일명이 비어있습니다.");
        }

        String timestamp = LocalDateTime.now().format(FORMATTER);
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFileName = sanitizeFileName(originalFileName);

        return String.format("%s_%s_%s", timestamp, uuid, sanitizedFileName);
    }

    /**
     * 파일명에서 확장자 추출
     *
     * @param fileName 파일명
     * @return 확장자 (소문자, 점 제외)
     */
    public static String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * 파일명 정제
     *
     * 특수문자 제거 및 공백을 언더스코어로 변경
     *
     * @param fileName 원본 파일명
     * @return 정제된 파일명
     */
    private static String sanitizeFileName(String fileName) {
        // 확장자 분리
        String extension = getFileExtension(fileName);
        String nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf("."));

        // 특수문자 제거 및 공백을 언더스코어로 변경
        String sanitized = nameWithoutExtension
                .replaceAll("[^a-zA-Z0-9가-힣._-]", "_")
                .replaceAll("\\s+", "_")
                .replaceAll("_+", "_");

        // 길이 제한 (최대 50자)
        if (sanitized.length() > 50) {
            sanitized = sanitized.substring(0, 50);
        }

        return sanitized + "." + extension;
    }

    /**
     * 파일명에서 원본 파일명 추출
     *
     * @param generatedFileName 생성된 파일명
     * @return 원본 파일명
     */
    public static String extractOriginalFileName(String generatedFileName) {
        if (generatedFileName == null || !generatedFileName.contains("_")) {
            return generatedFileName;
        }

        // timestamp_uuid_originalFileName 형식에서 originalFileName 추출
        String[] parts = generatedFileName.split("_", 3);
        return parts.length >= 3 ? parts[2] : generatedFileName;
    }
}
