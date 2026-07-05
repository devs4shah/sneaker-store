package com.prosneaker.sneakerstore.modules.sneakers.service;

import com.prosneaker.sneakerstore.config.storage.ImageStorageProperties;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.sneakers.dto.ReorderSneakerImagesRequest;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerImage;
import com.prosneaker.sneakerstore.modules.sneakers.mapper.SneakerMapper;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerImageRepository;
import com.prosneaker.sneakerstore.modules.sneakers.storage.LocalImageStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SneakerImageServiceTest {

    @Mock
    private SneakerService sneakerService;

    @Mock
    private SneakerImageRepository sneakerImageRepository;

    @Mock
    private LocalImageStorageService localImageStorageService;

    @Mock
    private SneakerMapper sneakerMapper;

    @Mock
    private ImageStorageProperties imageStorageProperties;

    @InjectMocks
    private SneakerImageService sneakerImageService;

    @Test
    void reorderImagesUpdatesDisplayOrder() {
        UUID sneakerId = UUID.randomUUID();
        UUID imageA = UUID.randomUUID();
        UUID imageB = UUID.randomUUID();

        Sneaker sneaker = new Sneaker();
        List<SneakerImage> images = new ArrayList<>();
        images.add(image(imageA, 0));
        images.add(image(imageB, 1));
        sneaker.setImages(images);

        ReorderSneakerImagesRequest request = new ReorderSneakerImagesRequest();
        request.setImageIds(List.of(imageB, imageA));

        when(sneakerService.findSneakerWithDetails(sneakerId)).thenReturn(sneaker);
        when(sneakerImageRepository.save(any(SneakerImage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        sneakerImageService.reorderImages(sneakerId, request);

        assertEquals(1, images.get(0).getDisplayOrder());
        assertEquals(0, images.get(1).getDisplayOrder());
        verify(sneakerImageRepository).save(images.get(0));
        verify(sneakerImageRepository).save(images.get(1));
    }

    @Test
    void reorderImagesRejectsDuplicateIds() {
        UUID sneakerId = UUID.randomUUID();
        UUID imageA = UUID.randomUUID();

        Sneaker sneaker = new Sneaker();
        sneaker.setImages(new ArrayList<>(List.of(image(imageA, 0))));

        ReorderSneakerImagesRequest request = new ReorderSneakerImagesRequest();
        request.setImageIds(List.of(imageA, imageA));

        when(sneakerService.findSneakerWithDetails(sneakerId)).thenReturn(sneaker);

        assertThrows(BusinessException.class, () -> sneakerImageService.reorderImages(sneakerId, request));
    }

    @Test
    void reorderImagesRejectsMissingImageId() {
        UUID sneakerId = UUID.randomUUID();
        UUID imageA = UUID.randomUUID();
        UUID imageB = UUID.randomUUID();

        Sneaker sneaker = new Sneaker();
        sneaker.setImages(new ArrayList<>(List.of(image(imageA, 0), image(imageB, 1))));

        ReorderSneakerImagesRequest request = new ReorderSneakerImagesRequest();
        request.setImageIds(List.of(imageB));

        when(sneakerService.findSneakerWithDetails(sneakerId)).thenReturn(sneaker);

        assertThrows(BusinessException.class, () -> sneakerImageService.reorderImages(sneakerId, request));
    }

    private static SneakerImage image(UUID id, int displayOrder) {
        SneakerImage image = new SneakerImage();
        image.setId(id);
        image.setDisplayOrder(displayOrder);
        image.setImageUrl("/uploads/test.jpg");
        return image;
    }
}
