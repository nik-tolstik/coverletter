import Image from "next/image";

export function AppHeader() {
  return (
    <header className="flex min-h-10 items-center justify-center">
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
    </header>
  );
}
