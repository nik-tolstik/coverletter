import { ResumePage } from "@/_pages/resume";
import { requireAuthenticatedUser } from "@/entities/auth/server";

export const dynamic = "force-dynamic";

export default async function ResumeRoute() {
  await requireAuthenticatedUser();

  return <ResumePage />;
}
