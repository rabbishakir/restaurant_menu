"use client";

import type { MenuItem, MenuItemType, MenuStatus } from "@prisma/client";
import { toPng } from "html-to-image";
import { useState } from "react";
import MenuPreview from "../MenuPreview";

type EditorMenu = {
  id: string;
  title: string;
  status: MenuStatus;
  titleFontSize: number;
  itemFontSize: number;
  contentTopOffset: number;
  contentWidth: number;
  overlayOpacity: number;
  zelleImagePath: string | null;
  zelleX: number;
  zelleY: number;
  zelleWidth: number;
  contactImagePath: string | null;
  contactX: number;
  contactY: number;
  contactWidth: number;
  backgroundImagePath: string | null;
};

type MenuEditorProps = {
  menu: EditorMenu;
  initialItems: MenuItem[];
};

export default function MenuEditor({ menu, initialItems }: MenuEditorProps) {
  const [title, setTitle] = useState(menu.title);
  const [status, setStatus] = useState<MenuStatus>(menu.status);
  const [titleFontSize, setTitleFontSize] = useState(menu.titleFontSize);
  const [itemFontSize, setItemFontSize] = useState(menu.itemFontSize);
  const [contentTopOffset, setContentTopOffset] = useState(menu.contentTopOffset);
  const [contentWidth, setContentWidth] = useState(menu.contentWidth);
  const [overlayOpacity, setOverlayOpacity] = useState(menu.overlayOpacity);

  const [zelleImagePath, setZelleImagePath] = useState<string | null>(menu.zelleImagePath);
  const [zelleX, setZelleX] = useState(menu.zelleX);
  const [zelleY, setZelleY] = useState(menu.zelleY);
  const [zelleWidth] = useState(menu.zelleWidth);

  const [contactImagePath, setContactImagePath] = useState<string | null>(menu.contactImagePath);
  const [contactX, setContactX] = useState(menu.contactX);
  const [contactY, setContactY] = useState(menu.contactY);
  const [contactWidth] = useState(menu.contactWidth);

  const [backgroundImagePath, setBackgroundImagePath] = useState<string | null>(
    menu.backgroundImagePath,
  );
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [addType, setAddType] = useState<MenuItemType>("ITEM");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [savingMenu, setSavingMenu] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [error, setError] = useState("");

  const previewId = `menu-preview-${menu.id}`;

  const saveMenu = async (data: {
    title?: string;
    status?: MenuStatus;
    backgroundImagePath?: string | null;
    titleFontSize?: number;
    itemFontSize?: number;
    contentTopOffset?: number;
    contentWidth?: number;
    overlayOpacity?: number;
    zelleImagePath?: string | null;
    zelleX?: number;
    zelleY?: number;
    zelleWidth?: number;
    contactImagePath?: string | null;
    contactX?: number;
    contactY?: number;
    contactWidth?: number;
  }) => {
    setSavingMenu(true);
    setError("");
    try {
      const res = await fetch(`/api/menus/${menu.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to save menu.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save menu.");
    } finally {
      setSavingMenu(false);
    }
  };

  const handleStatusChange = async (next: MenuStatus) => {
    setStatus(next);
    await saveMenu({ status: next });
  };

  const handleTitleBlur = async () => {
    const normalizedTitle = title.trim() || "New Menu";
    setTitle(normalizedTitle);
    await saveMenu({ title: normalizedTitle });
  };

  const handleTitleFontSizeChange = async (nextSize: number) => {
    setTitleFontSize(nextSize);
    await saveMenu({ titleFontSize: nextSize });
  };

  const handleItemFontSizeChange = async (nextSize: number) => {
    setItemFontSize(nextSize);
    await saveMenu({ itemFontSize: nextSize });
  };

  const handleContentTopOffsetChange = async (nextValue: number) => {
    setContentTopOffset(nextValue);
    await saveMenu({ contentTopOffset: nextValue });
  };

  const handleContentWidthChange = async (nextValue: number) => {
    setContentWidth(nextValue);
    await saveMenu({ contentWidth: nextValue });
  };

  const handleOverlayOpacityChange = async (nextValue: number) => {
    setOverlayOpacity(nextValue);
    await saveMenu({ overlayOpacity: nextValue });
  };

  const handleAddItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(addType === "CATEGORY" ? "Category name is required." : "Item name is required.");
      return;
    }
    if (addType === "ITEM" && !price.trim()) {
      setError("Item price is required.");
      return;
    }

    setAddingItem(true);
    setError("");
    try {
      const res = await fetch(`/api/menus/${menu.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: addType,
          name: name.trim(),
          price: addType === "CATEGORY" ? null : price.trim(),
        }),
      });

      const body = (await res.json()) as { data?: MenuItem; error?: string };
      if (!res.ok || !body.data) {
        throw new Error(body.error ?? "Failed to add item.");
      }

      setItems((current) => [...current, body.data as MenuItem].sort((a, b) => a.position - b.position));
      setName("");
      setPrice("");
      setAddType("ITEM");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add item.");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setError("");
    try {
      const res = await fetch(`/api/menus/${menu.id}/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to delete item.");
      }
      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete item.");
    }
  };

  const handleMoveItem = async (itemId: string, direction: "up" | "down") => {
    setError("");
    try {
      const res = await fetch(`/api/menus/${menu.id}/items/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, direction }),
      });

      const body = (await res.json()) as { data?: MenuItem[]; error?: string };
      if (!res.ok || !body.data) {
        throw new Error(body.error ?? "Failed to move item.");
      }

      setItems(body.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to move item.");
    }
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadBody = (await uploadRes.json()) as { path?: string; error?: string };
      if (!uploadRes.ok || !uploadBody.path) {
        throw new Error(uploadBody.error ?? "Upload failed.");
      }

      setBackgroundImagePath(uploadBody.path);
      await saveMenu({ backgroundImagePath: uploadBody.path });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Background upload failed.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleQrImageUpload = (target: "zelle" | "contact") => async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadBody = (await uploadRes.json()) as { path?: string; error?: string };
      if (!uploadRes.ok || !uploadBody.path) {
        throw new Error(uploadBody.error ?? "Upload failed.");
      }

      if (target === "zelle") {
        setZelleImagePath(uploadBody.path);
        await saveMenu({ zelleImagePath: uploadBody.path });
      } else {
        setContactImagePath(uploadBody.path);
        await saveMenu({ contactImagePath: uploadBody.path });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "QR upload failed.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleQrPositionCommit = async (
    target: "zelle" | "contact",
    x: number,
    y: number,
  ) => {
    if (target === "zelle") {
      setZelleX(x);
      setZelleY(y);
      await saveMenu({ zelleX: x, zelleY: y });
      return;
    }

    setContactX(x);
    setContactY(y);
    await saveMenu({ contactX: x, contactY: y });
  };

  const handleRemoveBackground = async () => {
    setBackgroundImagePath(null);
    await saveMenu({ backgroundImagePath: null });
  };

  const handleExportPng = async () => {
    const previewElement = document.getElementById(previewId);
    if (!previewElement) {
      setError("Preview is not ready for export.");
      return;
    }

    setExportingImage(true);
    setError("");

    try {
      const dataUrl = await toPng(previewElement, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = "menu.png";
      link.href = dataUrl;
      link.click();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export image.");
    } finally {
      setExportingImage(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="title">
                Menu Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
              />
              <p className="mt-1 text-xs text-slate-500">Title auto-saves when input loses focus.</p>
            </div>

            <div>
              <p className="mb-1 block text-sm font-medium text-slate-700">Status</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange("DRAFT")}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    status === "DRAFT"
                      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("PUBLISHED")}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Published
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="title-size">
                Title Font Size: {titleFontSize}px
              </label>
              <input
                id="title-size"
                type="range"
                min={24}
                max={80}
                value={titleFontSize}
                onChange={(e) => void handleTitleFontSizeChange(Number(e.target.value))}
                className="h-2 w-full rounded-full bg-gray-200 accent-teal-600"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="item-size">
                Item Font Size: {itemFontSize}px
              </label>
              <input
                id="item-size"
                type="range"
                min={12}
                max={40}
                value={itemFontSize}
                onChange={(e) => void handleItemFontSizeChange(Number(e.target.value))}
                className="h-2 w-full rounded-full bg-gray-200 accent-teal-600"
              />
            </div>
          </div>

          <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Layout Settings</h4>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700" htmlFor="content-top-offset">
                    Vertical Position
                  </label>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {contentTopOffset}px
                  </span>
                </div>
                <input
                  id="content-top-offset"
                  type="range"
                  min={0}
                  max={500}
                  value={contentTopOffset}
                  onChange={(e) => void handleContentTopOffsetChange(Number(e.target.value))}
                  className="h-2 w-full rounded-full bg-gray-200 accent-teal-600"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700" htmlFor="content-width">
                    Content Width
                  </label>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {contentWidth}px
                  </span>
                </div>
                <input
                  id="content-width"
                  type="range"
                  min={300}
                  max={900}
                  value={contentWidth}
                  onChange={(e) => void handleContentWidthChange(Number(e.target.value))}
                  className="h-2 w-full rounded-full bg-gray-200 accent-teal-600"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700" htmlFor="overlay-opacity">
                    Overlay Opacity
                  </label>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {overlayOpacity}%
                  </span>
                </div>
                <input
                  id="overlay-opacity"
                  type="range"
                  min={0}
                  max={80}
                  value={overlayOpacity}
                  onChange={(e) => void handleOverlayOpacityChange(Number(e.target.value))}
                  className="h-2 w-full rounded-full bg-gray-200 accent-teal-600"
                />
              </div>
            </div>
          </section>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-900">Background Image</h3>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleBackgroundUpload}
              className="block w-full cursor-pointer rounded-md border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
            />
            <button
              type="button"
              onClick={handleRemoveBackground}
              disabled={!backgroundImagePath || uploadingImage}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Supports JPG, PNG, and WEBP. The uploaded image is saved to /public/uploads.
          </p>
          {uploadingImage ? <p className="mt-2 text-sm text-slate-500">Uploading image...</p> : null}
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-900">QR Images</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Upload Zelle QR</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleQrImageUpload("zelle")}
                className="block w-full cursor-pointer rounded-md border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Upload Contact QR</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleQrImageUpload("contact")}
                className="block w-full cursor-pointer rounded-md border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Drag QR images directly in preview to position them.</p>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-900">Menu Items</h3>
          <form onSubmit={handleAddItem} className="mt-4 grid gap-3 sm:grid-cols-4">
            <select
              value={addType}
              onChange={(e) => setAddType(e.target.value as MenuItemType)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
            >
              <option value="ITEM">Item</option>
              <option value="CATEGORY">Category</option>
            </select>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={addType === "CATEGORY" ? "Category name" : "Item name"}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
            />
            {addType === "ITEM" ? (
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price (e.g. $12.99)"
                className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
              />
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">
                Category rows have no price.
              </div>
            )}
            <button
              type="submit"
              disabled={addingItem}
              className="rounded-md bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addingItem ? "Adding..." : addType === "CATEGORY" ? "+ Add Category" : "+ Add Item"}
            </button>
          </form>

          {items.length === 0 ? (
            <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              No items yet. Add your first item.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    {item.type === "CATEGORY" ? (
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-slate-900">{item.name}</p>
                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
                          Category
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-600">{item.price}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveItem(item.id, "up")}
                      disabled={index === 0}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveItem(item.id, "down")}
                      disabled={index === items.length - 1}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        {savingMenu ? <p className="text-sm text-slate-500">Saving...</p> : null}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Live Preview</h3>
            <button
              type="button"
              onClick={handleExportPng}
              disabled={exportingImage}
              className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportingImage ? "Exporting..." : "Export PNG"}
            </button>
          </div>

          <MenuPreview
            previewId={previewId}
            title={title}
            backgroundImagePath={backgroundImagePath}
            items={items}
            titleFontSize={titleFontSize}
            itemFontSize={itemFontSize}
            contentTopOffset={contentTopOffset}
            contentWidth={contentWidth}
            overlayOpacity={overlayOpacity}
            zelleImagePath={zelleImagePath}
            zelleX={zelleX}
            zelleY={zelleY}
            zelleWidth={zelleWidth}
            contactImagePath={contactImagePath}
            contactX={contactX}
            contactY={contactY}
            contactWidth={contactWidth}
            onQrPositionCommit={handleQrPositionCommit}
          />
        </section>
      </aside>
    </div>
  );
}
