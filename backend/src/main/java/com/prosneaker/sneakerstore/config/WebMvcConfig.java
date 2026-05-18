package com.prosneaker.sneakerstore.config;

import com.prosneaker.sneakerstore.config.storage.ImageStorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final ImageStorageProperties imageStorageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(imageStorageProperties.getUploadDir())
                .toAbsolutePath()
                .normalize();

        registry.addResourceHandler(imageStorageProperties.getPublicUrlPrefix() + "/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
