"use client";

import type { MenuItem, MenuStatus } from "@prisma/client";
import { useState } from "react";

type EditorMenu = {
  id: string;
  title: string;
  status: MenuStatus;
};

type MenuEditorProps = {
  menu: EditorMenu;
  initialItems: MenuItem[];
};

export default function MenuEditor({ menu, initialItems }: MenuEditorProps) {
  const [title, setTitle] = useState(menu.title);
  const [status, setStatus] = useState<MenuStatus>(menu.status);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [savingMenu, setSavingMenu] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [error, setError] = useState("");

  const saveMenu = async (data: { title?: string; status?: MenuStatus }) => {
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

  const handleAddItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !price.trim()) {
      setError("Item name and price are required.");
      return;
    }

    setAddingItem(true);
    setError("");
    try {
      const res = await fetch(`/api/menus/${menu.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), price: price.trim() }),
      });

      const body = (await res.json()) as { data?: MenuItem; error?: string };
      if (!res.ok || !body.data) {
        throw new Error(body.error ?? "Failed to add item.");
      }

      setItems((current) =>
        [...current, body.data as MenuItem].sort((a, b) => a.position - b.position),
      );
      setName("");
      setPrice("");
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

  return (
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
              onBlur={() => saveMenu({ title: title.trim() || "New Menu" })}
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
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-900">Menu Items</h3>
        <form onSubmit={handleAddItem} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price (e.g. $12.99)"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-teal-200"
          />
          <button
            type="submit"
            disabled={addingItem}
            className="rounded-md bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addingItem ? "Adding..." : "+ Add"}
          </button>
        </form>

        {items.length === 0 ? (
          <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            No items yet. Add your first item.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">{item.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Delete
                </button>
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
  );
}
