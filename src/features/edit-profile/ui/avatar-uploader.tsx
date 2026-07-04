"use client";

import {
  UploadIcon,
  UserRoundIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";

import { AvatarCropDialog } from "./avatar-crop-dialog";

export function AvatarUploader({
  avatarUrl,
  isUploading,
  previewUrl,
  avatarVersion,
  onUpload,
  onPreviewReady,
}: {
  avatarUrl: string;
  isUploading: boolean;
  previewUrl: string;
  avatarVersion: number;
  onUpload: (file: File) => void;
  onPreviewReady: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [isCropOpen, setIsCropOpen] = useState(false);
  const avatarApiSrc = avatarUrl
    ? `/api/profile/avatar?v=${avatarVersion}`
    : "";
  const avatarSrc = previewUrl || avatarApiSrc;
  const avatarKey = previewUrl || `${avatarUrl}-${avatarVersion}`;

  useEffect(() => {
    if (!cropImageUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(cropImageUrl);
    };
  }, [cropImageUrl]);

  function clearCropSelection() {
    setCropFile(null);
    setCropImageUrl("");
  }

  function handleCropOpenChange(open: boolean) {
    setIsCropOpen(open);
  }

  return (
    <div className="flex justify-center">
      <motion.button
        type="button"
        aria-label="Загрузить аватар"
        disabled={isUploading}
        className="group/avatar relative size-28 overflow-hidden rounded-full bg-muted text-muted-foreground outline-none transition-[filter,opacity,box-shadow] duration-200 hover:shadow-lg focus-visible:opacity-90 disabled:pointer-events-none disabled:opacity-70"
        whileHover={{ scale: isUploading ? 1 : 1.03 }}
        whileTap={{ scale: isUploading ? 1 : 0.98 }}
        onClick={() => inputRef.current?.click()}
      >
        {avatarSrc ? (
          <Image
            key={avatarKey}
            src={avatarSrc}
            alt=""
            fill
            unoptimized
            sizes="112px"
            className={cn(
              "object-cover transition-[filter,opacity,transform] duration-200 group-hover/avatar:scale-105 group-hover/avatar:blur-[1.5px] group-hover/avatar:brightness-110 group-hover/avatar:opacity-70 group-focus-visible/avatar:scale-105 group-focus-visible/avatar:blur-[1.5px] group-focus-visible/avatar:brightness-110 group-focus-visible/avatar:opacity-70",
              isUploading && "scale-105 brightness-105 saturate-90",
            )}
            draggable={false}
          />
        ) : (
          <span className="flex size-full items-center justify-center transition-opacity duration-200 group-hover/avatar:opacity-30 group-focus-visible/avatar:opacity-30">
            <UserRoundIcon className="size-11" aria-hidden="true" />
          </span>
        )}
        {previewUrl && avatarApiSrc && !isUploading && (
          <Image
            key={`persisted-${avatarUrl}-${avatarVersion}`}
            src={avatarApiSrc}
            alt=""
            fill
            unoptimized
            sizes="112px"
            className="object-cover opacity-0"
            draggable={false}
            onLoad={onPreviewReady}
          />
        )}
        {isUploading && (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-y-[-35%] left-[-85%] w-2/3 rotate-12 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.92)_48%,transparent_100%)] blur-sm animate-[avatar-glass-sheen_1.15s_cubic-bezier(0.22,1,0.36,1)_infinite]" />
          </span>
        )}
        {!isUploading && (
          <span
            className="absolute inset-0 flex items-center justify-center text-primary opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100"
            aria-hidden="true"
          >
            <UploadIcon className="size-7 drop-shadow-sm" />
          </span>
        )}
      </motion.button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];

          event.currentTarget.value = "";

          if (file) {
            setCropFile(file);
            setCropImageUrl(URL.createObjectURL(file));
            setIsCropOpen(true);
          }
        }}
      />
      <AvatarCropDialog
        key={cropImageUrl}
        file={cropFile}
        imageUrl={cropImageUrl}
        open={isCropOpen}
        onOpenChange={handleCropOpenChange}
        onExitComplete={clearCropSelection}
        onConfirm={(file) => {
          onUpload(file);
        }}
      />
    </div>
  );
}
