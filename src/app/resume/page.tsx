import { ResumePage } from "@/_pages/resume";
import { requireAuthenticatedUser } from "@/entities/auth/server";
import { getProfile } from "@/entities/profile/server";

export const dynamic = "force-dynamic";

export default async function ResumeRoute() {
  const user = await requireAuthenticatedUser();
  const profile = await getProfile(user.email);

  return <ResumePage initialProfile={profile} userEmail={user.email} />;
}
