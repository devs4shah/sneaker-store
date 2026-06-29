"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SneakerImage } from "@/components/products/SneakerImage";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatPrice } from "@/lib/format";
import { sortSneakerImages } from "@/lib/sneakerImages";
import {
  categoryFormSchema,
  sneakerFormSchema,
  type SneakerFormValues,
} from "@/lib/validations/adminProduct";
import { adminProductService } from "@/services/adminProductService";
import type { Category, CreateSneakerPayload, Gender, Sneaker, SneakerImage as SneakerImageType } from "@/types/adminProduct";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGES_PER_UPLOAD,
} from "@/types/adminProduct";
import type { PageResponse } from "@/types/product";

const PAGE_SIZE = 10;
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "UNISEX", label: "Unisex" },
  { value: "KIDS", label: "Kids" },
];

type FormMode = "create" | "edit" | null;

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
}

const emptyForm = (): SneakerFormValues => ({
  name: "",
  brand: "",
  description: "",
  price: 0,
  stockQuantity: 0,
  gender: "UNISEX",
  color: "",
  size: 0,
  categoryId: "",
});

function formFromSneaker(sneaker: Sneaker): SneakerFormValues {
  return {
    name: sneaker.name,
    brand: sneaker.brand,
    description: sneaker.description ?? "",
    price: sneaker.price,
    stockQuantity: sneaker.stockQuantity,
    gender: sneaker.gender,
    color: sneaker.color,
    size: sneaker.size,
    categoryId: sneaker.category.id,
  };
}

function buildCreatePayload(form: SneakerFormValues): CreateSneakerPayload {
  return {
    name: form.name.trim(),
    brand: form.brand.trim(),
    description: form.description?.trim() || undefined,
    price: form.price,
    stockQuantity: form.stockQuantity,
    gender: form.gender,
    color: form.color.trim(),
    size: form.size,
    categoryId: form.categoryId,
  };
}

function validateQueuedFiles(files: File[]): string | null {
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return `${file.name}: only JPEG, PNG, and WebP images are allowed`;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `${file.name}: file exceeds 5 MB limit`;
    }
  }
  return null;
}

function moveItem<T>(items: T[], fromIndex: number, direction: -1 | 1): T[] {
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function AdminProductsDashboard() {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<Sneaker> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingSneaker, setEditingSneaker] = useState<Sneaker | null>(null);
  const [form, setForm] = useState<SneakerFormValues>(emptyForm());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SneakerFormValues, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [reorderingImages, setReorderingImages] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [existingImages, setExistingImages] = useState<SneakerImageType[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await adminProductService.getCategories();
      setCategories(data);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to load categories"));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadSneakers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminProductService.getSneakers(page, PAGE_SIZE);
      setResult(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load products"));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    void loadSneakers();
  }, [page]);

  const filteredSneakers = useMemo(() => {
    const items = result?.content ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (sneaker) =>
        sneaker.name.toLowerCase().includes(q) ||
        sneaker.brand.toLowerCase().includes(q) ||
        sneaker.category.name.toLowerCase().includes(q),
    );
  }, [result?.content, search]);

  const clearQueuedFiles = () => {
    for (const queued of queuedFiles) {
      URL.revokeObjectURL(queued.previewUrl);
    }
    setQueuedFiles([]);
  };

  const openCreateForm = () => {
    setFormMode("create");
    setEditingSneaker(null);
    setForm(emptyForm());
    setFormErrors({});
    clearQueuedFiles();
    setExistingImages([]);
    setActionMessage(null);
    setActionError(null);
  };

  const openEditForm = async (sneaker: Sneaker) => {
    setFormMode("edit");
    setEditingSneaker(sneaker);
    setForm(formFromSneaker(sneaker));
    setFormErrors({});
    clearQueuedFiles();
    setExistingImages(sortSneakerImages(sneaker.images ?? []));
    setActionMessage(null);
    setActionError(null);

    try {
      const fresh = await adminProductService.getSneakerById(sneaker.id);
      setEditingSneaker(fresh);
      setForm(formFromSneaker(fresh));
      setExistingImages(sortSneakerImages(fresh.images ?? []));
    } catch {
      // Keep list data if detail fetch fails.
    }
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingSneaker(null);
    setForm(emptyForm());
    setFormErrors({});
    clearQueuedFiles();
    setExistingImages([]);
    setActionError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selected.length === 0) return;

    const validationError = validateQueuedFiles(selected);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    const newQueued: QueuedFile[] = selected.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setQueuedFiles((current) => [...current, ...newQueued]);
    setActionError(null);
  };

  const removeQueuedFile = (id: string) => {
    setQueuedFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const moveQueuedFile = (fromIndex: number, direction: -1 | 1) => {
    setQueuedFiles((current) => moveItem(current, fromIndex, direction));
  };

  const moveExistingImage = async (fromIndex: number, direction: -1 | 1) => {
    if (!editingSneaker) return;

    const reordered = moveItem(existingImages, fromIndex, direction);
    if (reordered === existingImages) return;

    const previous = existingImages;
    setExistingImages(reordered);
    setReorderingImages(true);
    setActionError(null);

    try {
      const updated = await adminProductService.reorderImages(
        editingSneaker.id,
        reordered.map((image) => image.id),
      );
      const sorted = sortSneakerImages(updated.images ?? []);
      setEditingSneaker(updated);
      setExistingImages(sorted);
      setActionMessage("Image order updated.");
      await loadSneakers();
    } catch (err) {
      setExistingImages(previous);
      setActionError(getApiErrorMessage(err, "Could not reorder images"));
    } finally {
      setReorderingImages(false);
    }
  };

  const handleCreateCategory = async () => {
    const parsed = categoryFormSchema.safeParse({ name: categoryName });
    if (!parsed.success) {
      setCategoryError(parsed.error.issues[0]?.message ?? "Invalid category name");
      return;
    }

    setIsCreatingCategory(true);
    setCategoryError(null);
    setActionMessage(null);
    setActionError(null);

    try {
      const created = await adminProductService.createCategory({ name: parsed.data.name.trim() });
      setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName("");
      setForm((current) => ({ ...current, categoryId: created.id }));
      setActionMessage(`Category "${created.name}" created.`);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not create category"));
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSave = async () => {
    if (categories.length === 0) {
      setActionError("Create a category before adding products.");
      return;
    }

    const parsed = sneakerFormSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof SneakerFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof SneakerFormValues;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setFormErrors(fieldErrors);
      setActionError("Please fix the highlighted fields.");
      return;
    }

    const queuedValidation = validateQueuedFiles(queuedFiles.map((item) => item.file));
    if (queuedValidation) {
      setActionError(queuedValidation);
      return;
    }

    setIsSaving(true);
    setActionMessage(null);
    setActionError(null);
    setFormErrors({});

    try {
      let sneakerId: string;

      if (formMode === "create") {
        const created = await adminProductService.createSneaker(buildCreatePayload(parsed.data));
        sneakerId = created.id;
        setActionMessage("Product created successfully.");
        setPage(0);
      } else if (formMode === "edit" && editingSneaker) {
        const updated = await adminProductService.updateSneaker(
          editingSneaker.id,
          buildCreatePayload(parsed.data),
        );
        sneakerId = updated.id;
        setActionMessage("Product updated successfully.");
      } else {
        return;
      }

      const hadQueuedUploads = queuedFiles.length > 0;

      if (hadQueuedUploads) {
        await adminProductService.uploadImages(
          sneakerId,
          queuedFiles.map((item) => item.file),
        );
        setActionMessage((current) =>
          current ? `${current} ${queuedFiles.length} image(s) uploaded.` : "Images uploaded.",
        );
      }

      await loadSneakers();

      if (formMode === "edit" && editingSneaker && hadQueuedUploads) {
        const refreshed = await adminProductService.getSneakerById(sneakerId);
        setEditingSneaker(refreshed);
        setForm(formFromSneaker(refreshed));
        setExistingImages(sortSneakerImages(refreshed.images ?? []));
        clearQueuedFiles();
        setActionMessage((current) =>
          current
            ? `${current} Reorder images below if needed — the first image is the shop cover.`
            : "Reorder images below if needed — the first image is the shop cover.",
        );
      } else {
        closeForm();
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not save product"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (sneaker: Sneaker) => {
    if (!window.confirm(`Delete "${sneaker.name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(sneaker.id);
    setActionMessage(null);
    setActionError(null);

    try {
      await adminProductService.deleteSneaker(sneaker.id);
      setActionMessage(`Deleted "${sneaker.name}".`);
      if (editingSneaker?.id === sneaker.id) {
        closeForm();
      }
      await loadSneakers();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not delete product"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!editingSneaker) return;

    setDeletingImageId(imageId);
    setActionError(null);

    try {
      const updated = await adminProductService.deleteImage(editingSneaker.id, imageId);
      setEditingSneaker(updated);
      setExistingImages(sortSneakerImages(updated.images ?? []));
      setActionMessage("Image removed.");
      await loadSneakers();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not delete image"));
    } finally {
      setDeletingImageId(null);
    }
  };

  const totalPages = result?.totalPages ?? 0;
  const inputClassName =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
  const labelClassName = "block text-sm";
  const fieldLabelClassName = "font-medium text-gray-700 dark:text-zinc-300";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-zinc-100">
            Product management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
            Create categories, add sneakers, and manage product images for the shop.
          </p>
          <Link
            href="/admin"
            className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            ← Back to admin hub
          </Link>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          disabled={categoriesLoading}
          className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          Add product
        </button>
      </div>

      <Alert variant="success" message={actionMessage ?? ""} />
      <Alert variant="error" message={actionError ?? ""} />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Categories</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
          Products require at least one category. Create one if your catalog is empty.
        </p>

        {categoriesLoading ? (
          <LoadingState message="Loading categories..." />
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className={`flex-1 ${labelClassName}`}>
              <span className={fieldLabelClassName}>New category</span>
              <input
                value={categoryName}
                onChange={(event) => {
                  setCategoryName(event.target.value);
                  setCategoryError(null);
                }}
                placeholder="e.g. Running"
                className={inputClassName}
              />
              {categoryError ? (
                <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{categoryError}</span>
              ) : null}
            </label>
            <button
              type="button"
              onClick={() => void handleCreateCategory()}
              disabled={isCreatingCategory}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {isCreatingCategory ? "Creating..." : "Create category"}
            </button>
          </div>
        )}

        {!categoriesLoading && categories.length > 0 ? (
          <p className="mt-3 text-sm text-gray-600 dark:text-zinc-400">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}:{" "}
            {categories.map((category) => category.name).join(", ")}
          </p>
        ) : null}

        {!categoriesLoading && categories.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-400">
            No categories yet — create one above before adding products.
          </p>
        ) : null}
      </div>

      {formMode ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            {formMode === "create" ? "New product" : `Edit ${editingSneaker?.name}`}
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              <span className={fieldLabelClassName}>Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className={inputClassName}
              />
              {formErrors.name ? (
                <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{formErrors.name}</span>
              ) : null}
            </label>

            <label className={labelClassName}>
              <span className={fieldLabelClassName}>Brand</span>
              <input
                value={form.brand}
                onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
                className={inputClassName}
              />
              {formErrors.brand ? (
                <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{formErrors.brand}</span>
              ) : null}
            </label>

            <label className={`sm:col-span-2 ${labelClassName}`}>
              <span className={fieldLabelClassName}>Description (optional)</span>
              <textarea
                rows={3}
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              <span className={fieldLabelClassName}>Price (₹)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.price || ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value === "" ? 0 : Number(event.target.value),
                  }))
                }
                className={inputClassName}
              />
              {formErrors.price ? (
                <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{formErrors.price}</span>
              ) : null}
            </label>

            <label className={labelClassName}>
              <span className={fieldLabelClassName}>Stock quantity</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity || ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    stockQuantity: event.target.value === "" ? 0 : Number(event.target.value),
                  }))
                }
                className={inputClassName}
              />
              {formErrors.stockQuantity ? (
                <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
                  {formErrors.stockQuantity}
                </span>
              ) : null}
            </label>

            <label className={labelClassName}>
              <span className={fieldLabelClassName}>Gender</span>
              <select
                value={form.gender}
                onChange={(event) =>
                  setForm((current) => ({ ...current, gender: event.target.value as Gender }))
                }
                className={inputClassName}
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClassName}>
              <span className={fieldLabelClassName}>Color</span>
              <input
                value={form.color}
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                className={inputClassName}
              />
              {formErrors.color ? (
                <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{formErrors.color}</span>
              ) : null}
            </label>

            <label className={labelClassName}>
              <span className={fieldLabelClassName}>Size (US)</span>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={form.size || ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    size: event.target.value === "" ? 0 : Number(event.target.value),
                  }))
                }
                className={inputClassName}
              />
              {formErrors.size ? (
                <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{formErrors.size}</span>
              ) : null}
            </label>

            <label className={labelClassName}>
              <span className={fieldLabelClassName}>Category</span>
              <select
                value={form.categoryId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, categoryId: event.target.value }))
                }
                disabled={categories.length === 0}
                className={inputClassName}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {formErrors.categoryId ? (
                <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
                  {formErrors.categoryId}
                </span>
              ) : null}
            </label>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-zinc-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Images</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
              Up to {MAX_IMAGES_PER_UPLOAD} images per upload, JPEG/PNG/WebP, max 5 MB each. The first
              image is the shop cover and the main photo on the product page.
            </p>

            {formMode === "edit" && existingImages.length > 0 ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Current images</p>
                <div className="mt-2 space-y-3">
                  {existingImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 dark:border-zinc-700"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                        <SneakerImage src={image.imageUrl} alt="Product image" sizes="80px" />
                        {index === 0 ? (
                          <span className="absolute bottom-0 left-0 right-0 bg-brand-600/90 px-1 py-0.5 text-center text-[10px] font-semibold uppercase text-white">
                            Cover
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                          Image {index + 1}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          {index === 0 ? "Shown on shop listing" : "Gallery image"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void moveExistingImage(index, -1)}
                          disabled={index === 0 || reorderingImages || deletingImageId === image.id}
                          className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          aria-label={`Move image ${index + 1} earlier`}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => void moveExistingImage(index, 1)}
                          disabled={
                            index === existingImages.length - 1 ||
                            reorderingImages ||
                            deletingImageId === image.id
                          }
                          className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          aria-label={`Move image ${index + 1} later`}
                        >
                          →
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteImage(image.id)}
                          disabled={deletingImageId === image.id || reorderingImages}
                          className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingImageId === image.id ? "..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <label className={labelClassName}>
                <span className={fieldLabelClassName}>
                  {formMode === "create" ? "Select images (optional)" : "Add more images (optional)"}
                </span>
                <input
                  type="file"
                  multiple
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={handleFileSelect}
                  className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 dark:text-zinc-400 dark:file:bg-brand-950/50 dark:file:text-brand-300"
                />
              </label>
            </div>

            {queuedFiles.length > 0 ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Queued for upload ({queuedFiles.length})
                </p>
                <div className="mt-2 space-y-3">
                  {queuedFiles.map((queued, index) => (
                    <div
                      key={queued.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 dark:border-zinc-700"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={queued.previewUrl}
                          alt={queued.file.name}
                          className="h-full w-full object-cover"
                        />
                        {index === 0 ? (
                          <span className="absolute bottom-0 left-0 right-0 bg-brand-600/90 px-1 py-0.5 text-center text-[10px] font-semibold uppercase text-white">
                            Cover
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">
                          {queued.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          Position {index + 1} after upload
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveQueuedFile(index, -1)}
                          disabled={index === 0}
                          className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          aria-label={`Move queued image ${index + 1} earlier`}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQueuedFile(index, 1)}
                          disabled={index === queuedFiles.length - 1}
                          className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          aria-label={`Move queued image ${index + 1} later`}
                        >
                          →
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQueuedFile(queued.id)}
                          className="rounded bg-gray-900 px-2 py-1 text-xs font-semibold text-white hover:bg-gray-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving || categories.length === 0}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {isSaving ? "Saving..." : formMode === "create" ? "Create product" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={isSaving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, brand, or category..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 sm:max-w-sm"
        />

        {isLoading ? (
          <div className="mt-6">
            <LoadingState message="Loading products..." />
          </div>
        ) : null}
        {!isLoading && error ? (
          <div className="mt-6">
            <ErrorState message={error} onRetry={() => void loadSneakers()} />
          </div>
        ) : null}

        {!isLoading && !error && filteredSneakers.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No products found"
              description="Add a category, then create your first sneaker."
            />
          </div>
        ) : null}

        {!isLoading && !error && filteredSneakers.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Brand</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Images</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSneakers.map((sneaker) => (
                  <tr key={sneaker.id} className="border-b border-gray-100 dark:border-zinc-800/80">
                    <td className="px-3 py-3 font-medium text-gray-900 dark:text-zinc-100">
                      {sneaker.name}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">{sneaker.brand}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">
                      {sneaker.category.name}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">
                      {formatPrice(sneaker.price)}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">{sneaker.stockQuantity}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">
                      {sneaker.images?.length ?? 0}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/sneakers/${sneaker.id}`}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => void openEditForm(sneaker)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(sneaker)}
                          disabled={deletingId === sneaker.id}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                        >
                          {deletingId === sneaker.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && !error && totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-600"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-zinc-400">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-600"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
