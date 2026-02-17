"use client";

import Link from "next/link";
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
    <div className="flex h-screen flex-col bg-gray-100">
      <header className="h-14 border-b border-slate-200 bg-white px-6">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/menus"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
            <p className="text-base font-semibold text-slate-900">{title || "New Menu"}</p>
          </div>
          <button
            type="button"
            onClick={handleExportPng}
            disabled={exportingImage}
            className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exportingImage ? "Exporting..." : "Export PNG"}
          </button>
        </div>
      </header>

      <main className="flex h-[calc(100vh-56px)] min-h-0">
        <aside className="w-[400px] overflow-y-auto border-r border-slate-200 bg-white p-4">
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Menu</h3>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("DRAFT")}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
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
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                      status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Typography</h3>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600" htmlFor="title-size">
                    Title Size
                  </label>
                  <span className="text-xs font-semibold text-slate-700">{titleFontSize}px</span>
                </div>
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
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600" htmlFor="item-size">
                    Item Size
                  </label>
                  <span className="text-xs font-semibold text-slate-700">{itemFontSize}px</span>
                </div>
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
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Layout Settings</h3>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600" htmlFor="content-top-offset">
                    Vertical Position
                  </label>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
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
                  <label className="text-xs font-medium text-slate-600" htmlFor="content-width">
                    Content Width
                  </label>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
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
                  <label className="text-xs font-medium text-slate-600" htmlFor="overlay-opacity">
                    Overlay Opacity
                  </label>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
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
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Images</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Background</label>
                  {backgroundImagePath ? (
                    <div className="relative inline-block">
                      <img
                        src={backgroundImagePath}
                        alt="Background"
                        className="h-[80px] w-[80px] rounded-md object-cover ring-1 ring-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveBackground}
                        disabled={uploadingImage}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Remove Background"
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        id="background-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="background-upload"
                        className="inline-flex cursor-pointer rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
                      >
                        Upload
                      </label>
                    </>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Zelle QR</label>
                  {zelleImagePath ? (
                    <div className="relative inline-block">
                      <img
                        src={zelleImagePath}
                        alt="Zelle QR"
                        className="h-[80px] w-[80px] rounded-md object-cover ring-1 ring-slate-200"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setZelleImagePath(null);
                          await saveMenu({ zelleImagePath: null });
                        }}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow"
                        aria-label="Remove Zelle QR"
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        id="zelle-qr-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleQrImageUpload("zelle")}
                        className="hidden"
                      />
                      <label
                        htmlFor="zelle-qr-upload"
                        className="inline-flex cursor-pointer rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
                      >
                        Upload
                      </label>
                    </>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Contact QR</label>
                  {contactImagePath ? (
                    <div className="relative inline-block">
                      <img
                        src={contactImagePath}
                        alt="Contact QR"
                        className="h-[80px] w-[80px] rounded-md object-cover ring-1 ring-slate-200"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setContactImagePath(null);
                          await saveMenu({ contactImagePath: null });
                        }}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow"
                        aria-label="Remove Contact QR"
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        id="contact-qr-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleQrImageUpload("contact")}
                        className="hidden"
                      />
                      <label
                        htmlFor="contact-qr-upload"
                        className="inline-flex cursor-pointer rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
                      >
                        Upload
                      </label>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Items</h3>
              <form onSubmit={handleAddItem} className="space-y-2">
                <select
                  value={addType}
                  onChange={(e) => setAddType(e.target.value as MenuItemType)}
                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
                >
                  <option value="ITEM">Item</option>
                  <option value="CATEGORY">Category</option>
                </select>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={addType === "CATEGORY" ? "Category name" : "Item name"}
                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
                />
                {addType === "ITEM" ? (
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price"
                    className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
                  />
                ) : null}
                <button
                  type="submit"
                  disabled={addingItem}
                  className="w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingItem ? "Adding..." : addType === "CATEGORY" ? "+ Add Category" : "+ Add Item"}
                </button>
              </form>

              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={item.id} className="rounded-md border border-slate-200 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {item.type === "CATEGORY" ? (
                          <div className="flex items-center gap-1">
                            <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                            <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                              Category
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-600">{item.price}</p>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(item.id, "up")}
                          disabled={index === 0}
                          className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(item.id, "down")}
                          disabled={index === items.length - 1}
                          className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {error ? (
              <p className="rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700">{error}</p>
            ) : null}
            {savingMenu ? <p className="text-xs text-slate-500">Saving...</p> : null}
          </div>
        </aside>

        <section className="flex flex-1 items-center justify-center bg-gray-200 p-6">
          <div className="w-full max-w-5xl rounded-md shadow-2xl">
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
          </div>
        </section>
      </main>
    </div>
  );
}
