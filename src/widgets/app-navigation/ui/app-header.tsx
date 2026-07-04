import Image from "next/image";

import { UserMenu } from "./user-menu";

export function AppHeader({
  userEmail,
  userAvatarUrl,
}: {
  userEmail: string;
  userAvatarUrl?: string;
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
        <UserMenu avatarUrl={userAvatarUrl} email={userEmail} />
      </div>
    </header>
  );
}
