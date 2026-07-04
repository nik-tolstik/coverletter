import Image from "next/image";

import type { ProfileState } from "@/entities/profile";

import { UserMenu } from "./user-menu";

export function AppHeader({
  initialProfile,
  userEmail,
}: {
  initialProfile: ProfileState;
  userEmail: string;
}) {
  return (
    <header className="relative flex min-h-10 items-center justify-center px-12">
      <div className="flex min-w-0 items-center justify-center gap-3">
        <Image
          src="/icon.svg"
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-xl"
          priority
        />
        <span className="min-w-0 truncate font-heading text-xl font-bold">
          Coverletter
        </span>
      </div>

      <div className="absolute top-1/2 right-0 -translate-y-1/2">
        <UserMenu initialProfile={initialProfile} userEmail={userEmail} />
      </div>
    </header>
  );
}
