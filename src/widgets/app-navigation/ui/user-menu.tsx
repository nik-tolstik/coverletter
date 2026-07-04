"use client";

import { LogOutIcon, UserRoundIcon } from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function UserMenu({
  avatarUrl,
  email,
}: {
  avatarUrl?: string;
  email: string;
}) {
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState("");
  const currentAvatarUrl = uploadedAvatarUrl || avatarUrl || "";
  const avatarSrc = currentAvatarUrl ? "/api/profile/avatar" : "";

  useEffect(() => {
    function handleAvatarUpdated(event: Event) {
      const avatarEvent = event as CustomEvent<{ avatarUrl?: string }>;

      setUploadedAvatarUrl(avatarEvent.detail?.avatarUrl ?? "");
    }

    window.addEventListener("profile-avatar-updated", handleAvatarUpdated);

    return () => {
      window.removeEventListener("profile-avatar-updated", handleAvatarUpdated);
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Меню пользователя"
          title={email}
          className="overflow-hidden rounded-full"
        >
          {currentAvatarUrl ? (
            <Image
              key={currentAvatarUrl}
              src={avatarSrc}
              alt=""
              width={36}
              height={36}
              unoptimized
              sizes="36px"
              className="size-full object-cover transition-transform duration-200 group-hover/button:scale-105"
              draggable={false}
            />
          ) : (
            <UserRoundIcon />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            event.preventDefault();
            void signOut({ redirectTo: "/auth" });
          }}
        >
          <LogOutIcon />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
