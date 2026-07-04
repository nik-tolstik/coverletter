"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type ImageSize = {
  width: number;
  height: number;
};

type CropOffset = {
  x: number;
  y: number;
};

type DragState = CropOffset & {
  pointerId: number;
  startX: number;
  startY: number;
};

const minZoom = 1;
const maxZoom = 3;
const outputAvatarSize = 512;

export function AvatarCropDialog({
  file,
  imageUrl,
  open,
  onOpenChange,
  onExitComplete,
  onConfirm,
}: {
  file: File | null;
  imageUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExitComplete: () => void;
  onConfirm: (file: File) => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>();
  const [cropSize, setCropSize] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const baseScale = useMemo(() => {
    if (!imageSize || !cropSize) {
      return 1;
    }

    return Math.max(cropSize / imageSize.width, cropSize / imageSize.height);
  }, [cropSize, imageSize]);
  const scale = baseScale * zoom;

  const clampOffset = useCallback(
    (nextOffset: CropOffset, nextScale = scale, nextCropSize = cropSize) =>
      clampCropOffset(nextOffset, imageSize, nextCropSize, nextScale),
    [cropSize, imageSize, scale],
  );

  useEffect(() => {
    const measuredCropElement = cropRef.current;

    if (!measuredCropElement) {
      return;
    }

    const cropElement: HTMLDivElement = measuredCropElement;

    function updateCropSize() {
      const nextCropSize = cropElement.clientWidth;

      setCropSize(nextCropSize);
      setOffset((currentOffset) =>
        clampOffset(currentOffset, scale, nextCropSize),
      );
    }

    updateCropSize();

    const observer = new ResizeObserver(updateCropSize);

    observer.observe(cropElement);

    return () => {
      observer.disconnect();
    };
  }, [clampOffset, open, scale]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!imageSize) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: offset.x,
      y: offset.y,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setOffset(
      clampOffset({
        x: dragState.x + event.clientX - dragState.startX,
        y: dragState.y + event.clientY - dragState.startY,
      }),
    );
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function handleConfirm() {
    const image = imageRef.current;

    if (!file || !image || !imageSize || !cropSize) {
      return;
    }

    setIsProcessing(true);

    try {
      const croppedFile = await createCroppedFile(
        file,
        image,
        cropSize,
        scale,
        offset,
      );

      setIsProcessing(false);
      onConfirm(croppedFile);
      onOpenChange(false);
    } catch {
      setIsProcessing(false);
      toast.error("Не удалось обработать изображение.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-5 sm:max-w-md"
        onAnimationEnd={(event) => {
          if (event.currentTarget === event.target && !open) {
            onExitComplete();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Обрезать аватар</DialogTitle>
          <DialogDescription className="sr-only">
            Настройте область аватара перед загрузкой.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={cropRef}
          className="relative mx-auto aspect-square w-full max-w-80 touch-none overflow-hidden rounded-full bg-muted shadow-inner"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {imageUrl ? (
            <Image
              ref={imageRef}
              src={imageUrl}
              alt=""
              width={imageSize?.width ?? 1}
              height={imageSize?.height ?? 1}
              unoptimized
              className="absolute top-1/2 left-1/2 max-w-none select-none"
              draggable={false}
              style={{
                width: imageSize?.width,
                height: imageSize?.height,
                transform: `translate3d(-50%, -50%, 0) translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
              }}
              onLoad={(event) => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
                setImageSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                });
              }}
            />
          ) : null}
        </div>

        <div className="grid gap-3">
          <label
            htmlFor="avatar-crop-zoom"
            className="text-sm font-medium text-foreground"
          >
            Масштаб
          </label>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <MinusIcon className="size-4 text-muted-foreground" />
            <input
              id="avatar-crop-zoom"
              type="range"
              min={minZoom}
              max={maxZoom}
              step="0.01"
              value={zoom}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-input/50 accent-primary"
              onChange={(event) => {
                const nextZoom = Number(event.currentTarget.value);
                const nextScale = baseScale * nextZoom;

                setZoom(nextZoom);
                setOffset((currentOffset) =>
                  clampOffset(currentOffset, nextScale),
                );
              }}
            />
            <PlusIcon className="size-4 text-muted-foreground" />
          </div>
        </div>

        <DialogFooter className="sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isProcessing}
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            disabled={!imageSize || !cropSize || isProcessing}
            onClick={() => void handleConfirm()}
          >
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function createCroppedFile(
  file: File,
  image: HTMLImageElement,
  cropSize: number,
  scale: number,
  offset: CropOffset,
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context is unavailable.");
  }

  const sourceSize = cropSize / scale;
  const sourceX = image.naturalWidth / 2 - sourceSize / 2 - offset.x / scale;
  const sourceY = image.naturalHeight / 2 - sourceSize / 2 - offset.y / scale;

  canvas.width = outputAvatarSize;
  canvas.height = outputAvatarSize;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    outputAvatarSize,
    outputAvatarSize,
  );

  const type = getOutputType(file.type);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, 0.92);
  });

  if (!blob) {
    throw new Error("Avatar crop failed.");
  }

  return new File([blob], `avatar.${getOutputExtension(type)}`, { type });
}

function getOutputType(type: string) {
  if (type === "image/png" || type === "image/webp") {
    return type;
  }

  return "image/jpeg";
}

function getOutputExtension(type: string) {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function clampCropOffset(
  offset: CropOffset,
  imageSize: ImageSize | undefined,
  cropSize: number,
  scale: number,
) {
  if (!imageSize || !cropSize) {
    return offset;
  }

  const displayWidth = imageSize.width * scale;
  const displayHeight = imageSize.height * scale;
  const maxX = Math.max(0, (displayWidth - cropSize) / 2);
  const maxY = Math.max(0, (displayHeight - cropSize) / 2);

  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  };
}
