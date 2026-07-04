"use client";

import {
  LoaderCircleIcon,
  UploadIcon,
  UserRoundIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { cn } from "@/shared/lib/utils";

export function AvatarUploader({
  avatarUrl,
  isUploading,
  onUpload,
}: {
  avatarUrl: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = isUploading ? LoaderCircleIcon : UploadIcon;
  const avatarSrc = avatarUrl ? "/api/profile/avatar" : "";

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
        {avatarUrl ? (
          <Image
            key={avatarUrl}
            src={avatarSrc}
            alt=""
            fill
            unoptimized
            sizes="112px"
            className="object-cover transition-[filter,opacity] duration-200 group-hover/avatar:blur-[1.5px] group-hover/avatar:brightness-110 group-hover/avatar:opacity-70 group-focus-visible/avatar:blur-[1.5px] group-focus-visible/avatar:brightness-110 group-focus-visible/avatar:opacity-70"
            draggable={false}
          />
        ) : (
          <span className="flex size-full items-center justify-center transition-opacity duration-200 group-hover/avatar:opacity-30 group-focus-visible/avatar:opacity-30">
            <UserRoundIcon className="size-11" aria-hidden="true" />
          </span>
        )}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-primary opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100",
            isUploading && "opacity-100",
          )}
          aria-hidden="true"
        >
          <Icon className="size-7 drop-shadow-sm" />
        </span>
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
            onUpload(file);
          }
        }}
      />
    </div>
  );
}
