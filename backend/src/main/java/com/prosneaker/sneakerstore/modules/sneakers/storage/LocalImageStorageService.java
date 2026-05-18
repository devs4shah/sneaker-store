package com.prosneaker.sneakerstore.modules.sneakers.storage;

import com.prosneaker.sneakerstore.config.storage.ImageStorageProperties;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocalImageStorageService {

    private final ImageStorageProperties properties;
    private Path rootUploadPath;

    @PostConstruct
    void init() throws IOException {
        rootUploadPath = Paths.get(properties.getUploadDir()).toAbsolutePath().normalize();
        Files.createDirectories(rootUploadPath.resolve("sneakers"));
    }

    public StoredImage store(UUID sneakerId, MultipartFile file) {
        validateFile(file);

        String extension = resolveExtension(file);
        String storedFileName = UUID.randomUUID() + extension;
        String relativePath = properties.getPublicUrlPrefix()
                + "/sneakers/" + sneakerId + "/" + storedFileName;

        Path targetDir = rootUploadPath.resolve("sneakers").resolve(sneakerId.toString());
        Path targetFile = targetDir.resolve(storedFileName);

        try {
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to store image file");
        }

        return new StoredImage(storedFileName, relativePath, targetFile);
    }

    public void deleteByPublicPath(String publicPath) {
        if (publicPath == null || publicPath.isBlank()) {
            return;
        }

        String prefix = properties.getPublicUrlPrefix() + "/";
        if (!publicPath.startsWith(prefix)) {
            return;
        }

        String relative = publicPath.substring(prefix.length());
        Path filePath = rootUploadPath.resolve(relative).normalize();

        if (!filePath.startsWith(rootUploadPath)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid image path");
        }

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to delete image file");
        }
    }

    public void deleteSneakerDirectory(UUID sneakerId) {
        Path sneakerDir = rootUploadPath.resolve("sneakers").resolve(sneakerId.toString());
        if (!Files.exists(sneakerDir)) {
            return;
        }

        try {
            Files.walk(sneakerDir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ex) {
                            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to delete sneaker images");
                        }
                    });
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to delete sneaker image directory");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Image file is empty");
        }

        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Image exceeds maximum size of " + (properties.getMaxFileSizeBytes() / (1024 * 1024)) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !properties.getAllowedContentTypes().contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Unsupported image type. Allowed: JPEG, PNG, WEBP");
        }

        String extension = resolveExtension(file);
        if (!properties.getAllowedExtensions().contains(extension)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Unsupported image extension");
        }
    }

    private String resolveExtension(MultipartFile file) {
        String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        String extension = "";

        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex).toLowerCase(Locale.ROOT);
        }

        if (extension.isEmpty()) {
            extension = switch (file.getContentType()) {
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                default -> ".jpg";
            };
        }

        return extension;
    }

    public record StoredImage(String fileName, String publicPath, Path absolutePath) {
    }
}
