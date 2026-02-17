"use client";

import type { MenuItem } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

type MenuPreviewProps = {
  title: string;
  backgroundImagePath: string | null;
  items: Pick<MenuItem, "id" | "name" | "price" | "type">[];
  previewId: string;
  titleFontSize: number;
  itemFontSize: number;
};

function splitIntoColumns<T>(array: T[]): [T[], T[]] {
  const middle = Math.ceil(array.length / 2);
  return [array.slice(0, middle), array.slice(middle)];
}

export default function MenuPreview({
  title,
  backgroundImagePath,
  items,
  previewId,
  titleFontSize,
  itemFontSize,
}: MenuPreviewProps) {
  const [textColor, setTextColor] = useState<"text-white" | "text-slate-900">("text-slate-900");
  const [shadowClass, setShadowClass] = useState("drop-shadow-sm");

  useEffect(() => {
    let cancelled = false;

    const evaluateContrast = async () => {
      if (!backgroundImagePath) {
        if (!cancelled) {
          setTextColor("text-slate-900");
          setShadowClass("drop-shadow-none");
        }
        return;
      }

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = backgroundImagePath;
        await img.decode();

        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const context = canvas.getContext("2d");
        if (!context) return;

        context.drawImage(img, 0, 0, 16, 16);
        const pixels = context.getImageData(0, 0, 16, 16).data;
        let totalLuminance = 0;
        let count = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
          count += 1;
        }

        const average = totalLuminance / Math.max(count, 1);
        if (!cancelled) {
          if (average > 150) {
            setTextColor("text-slate-900");
            setShadowClass("drop-shadow-none");
          } else {
            setTextColor("text-white");
            setShadowClass("drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]");
          }
        }
      } catch {
        if (!cancelled) {
          setTextColor("text-white");
          setShadowClass("drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]");
        }
      }
    };

    void evaluateContrast();
    return () => {
      cancelled = true;
    };
  }, [backgroundImagePath]);

  const [leftItems, rightItems] = useMemo(() => splitIntoColumns(items), [items]);
  const titleText = title.trim() || "New Menu";

  return (
    <div className="w-full rounded-xl bg-slate-100 p-3 ring-1 ring-slate-200">
      <div
        id={previewId}
        className={`relative mx-auto aspect-[8/11] w-full max-w-[680px] overflow-hidden rounded-lg bg-white ${textColor}`}
        style={{
          backgroundImage: backgroundImagePath ? `url(${backgroundImagePath})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className={`absolute inset-0 ${backgroundImagePath ? "bg-black/20" : "bg-transparent"}`}
        />
        <div
          className={`relative z-10 flex h-full flex-col px-[7%] pb-[7%] pt-[6%] ${shadowClass}`}
        >
          <h1
            className="text-center font-bold uppercase tracking-[0.08em]"
            style={{ fontSize: `${titleFontSize}px` }}
          >
            {titleText}
          </h1>
          <div
            className="mt-[5%] grid flex-1 grid-cols-2 gap-[4%] leading-relaxed"
            style={{ fontSize: `${itemFontSize}px` }}
          >
            <div className="space-y-5">
              {leftItems.map((item) => (
                item.type === "CATEGORY" ? (
                  <div key={item.id} className="border-b border-current/25 pb-1">
                    <span className="text-[1.08em] font-bold uppercase tracking-[0.03em]">
                      {item.name}
                    </span>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="flex items-end justify-between gap-4 border-b border-current/20 pb-1"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="font-semibold">{item.price}</span>
                  </div>
                )
              ))}
            </div>
            <div className="space-y-5">
              {rightItems.map((item) => (
                item.type === "CATEGORY" ? (
                  <div key={item.id} className="border-b border-current/25 pb-1">
                    <span className="text-[1.08em] font-bold uppercase tracking-[0.03em]">
                      {item.name}
                    </span>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="flex items-end justify-between gap-4 border-b border-current/20 pb-1"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="font-semibold">{item.price}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
