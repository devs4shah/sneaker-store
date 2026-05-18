package com.prosneaker.sneakerstore.config.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.storage")
public class ImageStorageProperties {

    private String uploadDir = "uploads";
    private long maxFileSizeBytes = 5 * 1024 * 1024;
    private int maxFilesPerRequest = 10;
    private List<String> allowedContentTypes = List.of("image/jpeg", "image/png", "image/webp");
    private List<String> allowedExtensions = List.of(".jpg", ".jpeg", ".png", ".webp");
    private String publicUrlPrefix = "/uploads";
}
