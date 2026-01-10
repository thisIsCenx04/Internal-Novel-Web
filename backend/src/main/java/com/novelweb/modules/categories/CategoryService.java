package com.novelweb.modules.categories;

import com.novelweb.common.exception.ApiException;
import com.novelweb.common.utils.SlugUtil;
import com.novelweb.domain.entity.Category;
import com.novelweb.modules.categories.dto.CategoryRequest;
import com.novelweb.modules.categories.dto.CategoryResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> list() {
        return categoryRepository.findAll()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public CategoryResponse create(CategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ApiException(HttpStatus.CONFLICT, "Category already exists");
        }
        Category category = new Category();
        category.setName(name);
        category.setSlug(SlugUtil.toSlug(name));
        return toResponse(categoryRepository.save(category));
    }

    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));
        String name = request.getName().trim();
        category.setName(name);
        category.setSlug(SlugUtil.toSlug(name));
        return toResponse(categoryRepository.save(category));
    }

    public void delete(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Category not found");
        }
        categoryRepository.deleteById(id);
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getSlug());
    }
}
