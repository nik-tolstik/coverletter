import type { Metadata } from "next";
import "./globals.css";
import { Manrope, Onest } from "next/font/google";
import { cn } from "@/shared/lib/utils";
import { AppProviders } from "@/_app/providers";
import { getAuthenticatedUser } from "@/entities/auth/server";
import { getProfile } from "@/entities/profile/server";
import { AppBottomNavigation } from "@/widgets/app-navigation";

const manropeHeading = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
});

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Coverletter",
  description: "Генератор сопроводительных писем",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();
  const profile = user ? await getProfile(user.email) : null;

  return (
    <html
      lang="ru"
      className={cn("font-sans", onest.variable, manropeHeading.variable)}
    >
      <body>
        <AppProviders>
          {children}
          {user && profile ? (
            <AppBottomNavigation
              initialProfile={profile}
              userEmail={user.email}
            />
          ) : null}
        </AppProviders>
      </body>
    </html>
  );
}
