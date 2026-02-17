"use client";

import type { MenuItem } from "@prisma/client";
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

type DraggableTarget = "zelle" | "contact";

type MenuPreviewProps = {
  title: string;
  backgroundImagePath: string | null;
  items: Pick<MenuItem, "id" | "name" | "price" | "type">[];
  previewId: string;
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
  onQrPositionCommit: (target: DraggableTarget, x: number, y: number) => Promise<void>;
};

type DragState = {
  target: DraggableTarget;
  offsetX: number;
  offsetY: number;
} | null;

type Coordinates = {
  zelle: { x: number; y: number };
  contact: { x: number; y: number };
};

function splitIntoColumns<T>(array: T[]): [T[], T[]] {
  const middle = Math.ceil(array.length / 2);
  return [array.slice(0, middle), array.slice(middle)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function MenuPreview({
  title,
  backgroundImagePath,
  items,
  previewId,
  titleFontSize,
  itemFontSize,
  contentTopOffset,
  contentWidth,
  overlayOpacity,
  zelleImagePath,
  zelleX,
  zelleY,
  zelleWidth,
  contactImagePath,
  contactX,
  contactY,
  contactWidth,
  onQrPositionCommit,
}: MenuPreviewProps) {
  const [textColor, setTextColor] = useState<"text-white" | "text-slate-900">("text-slate-900");
  const [shadowClass, setShadowClass] = useState("drop-shadow-sm");
  const [dragState, setDragState] = useState<DragState>(null);
  const [positions, setPositions] = useState<Coordinates>({
    zelle: { x: zelleX, y: zelleY },
    contact: { x: contactX, y: contactY },
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (dragState) return;
    setPositions({
      zelle: { x: zelleX, y: zelleY },
      contact: { x: contactX, y: contactY },
    });
  }, [zelleX, zelleY, contactX, contactY, dragState]);

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

  useEffect(() => {
    if (!dragState) return;

    const onMouseMove = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const rawX = event.clientX - rect.left - dragState.offsetX;
      const rawY = event.clientY - rect.top - dragState.offsetY;
      const width = dragState.target === "zelle" ? zelleWidth : contactWidth;

      const nextX = clamp(Math.round(rawX), 0, Math.max(0, rect.width - width));
      const nextY = clamp(Math.round(rawY), 0, Math.max(0, rect.height - width));

      setPositions((current) => ({
        ...current,
        [dragState.target]: { x: nextX, y: nextY },
      }));
    };

    const onMouseUp = async () => {
      const target = dragState.target;
      const coords = positions[target];
      setDragState(null);
      await onQrPositionCommit(target, coords.x, coords.y);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragState, positions, zelleWidth, contactWidth, onQrPositionCommit]);

  const [leftItems, rightItems] = useMemo(() => splitIntoColumns(items), [items]);
  const titleText = title.trim() || "New Menu";

  const startDrag = (target: DraggableTarget) => (event: ReactMouseEvent<HTMLImageElement>) => {
    const container = containerRef.current;
    if (!container) return;

    event.preventDefault();

    const rect = container.getBoundingClientRect();
    const pos = positions[target];
    const offsetX = event.clientX - rect.left - pos.x;
    const offsetY = event.clientY - rect.top - pos.y;

    setDragState({ target, offsetX, offsetY });
  };

  return (
    <div className="w-full rounded-xl bg-slate-100 p-3 ring-1 ring-slate-200">
      <div
        id={previewId}
        ref={containerRef}
        className={`relative mx-auto aspect-[8/11] w-full max-w-[680px] overflow-hidden rounded-lg bg-white ${textColor}`}
        style={{
          backgroundImage: backgroundImagePath ? `url(${backgroundImagePath})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: backgroundImagePath
              ? `rgba(0, 0, 0, ${overlayOpacity / 100})`
              : "transparent",
          }}
        />

        {zelleImagePath ? (
          <img
            src={zelleImagePath}
            alt="Zelle QR"
            draggable={false}
            onMouseDown={startDrag("zelle")}
            className="absolute z-20 cursor-move select-none rounded-sm"
            style={{
              left: positions.zelle.x,
              top: positions.zelle.y,
              width: zelleWidth,
            }}
          />
        ) : null}

        {contactImagePath ? (
          <img
            src={contactImagePath}
            alt="Contact QR"
            draggable={false}
            onMouseDown={startDrag("contact")}
            className="absolute z-20 cursor-move select-none rounded-sm"
            style={{
              left: positions.contact.x,
              top: positions.contact.y,
              width: contactWidth,
            }}
          />
        ) : null}

        <div
          className={`relative z-10 mx-auto flex h-full flex-col px-[7%] pb-[7%] ${shadowClass}`}
          style={{
            width: `min(100%, ${contentWidth}px)`,
            paddingTop: `${contentTopOffset}px`,
          }}
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
              {leftItems.map((item) =>
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
                ),
              )}
            </div>
            <div className="space-y-5">
              {rightItems.map((item) =>
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
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
