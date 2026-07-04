"use client";

import { LogOutIcon, UserRoundIcon } from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";

import { useProfileQuery, type ProfileState } from "@/entities/profile";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function UserMenu({
  initialProfile,
  userEmail,
}: {
  initialProfile: ProfileState;
  userEmail: string;
}) {
  const profileQuery = useProfileQuery({
    initialProfile,
    userEmail,
  });
  const currentProfile = profileQuery.data ?? initialProfile;
  const currentAvatarUrl = currentProfile.profile.identity.avatarUrl;
  const avatarVersion = currentProfile.updatedAt || currentAvatarUrl;
  const avatarSrc = currentAvatarUrl
    ? `/api/profile/avatar?v=${encodeURIComponent(avatarVersion)}`
    : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Меню пользователя"
          title={userEmail}
          className="overflow-hidden rounded-full"
        >
          {currentAvatarUrl ? (
            <Image
              key={avatarVersion}
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
