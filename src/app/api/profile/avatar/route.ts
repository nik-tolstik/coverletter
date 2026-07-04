import { del, get as getBlob, put } from "@vercel/blob";

import { requireApiAuthenticatedUser } from "@/entities/auth/server";
import { getProfile, saveProfile } from "@/entities/profile/server";
import { profileWriteRequestSchema } from "@/features/edit-profile/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxAvatarSizeBytes = 5 * 1024 * 1024;

export async function GET() {
  const user = await requireApiAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Требуется вход." }, { status: 401 });
  }

  try {
    const profile = await getProfile(user.email);
    const avatarUrl = profile.profile.identity.avatarUrl;

    if (!avatarUrl) {
      return new Response(null, { status: 404 });
    }

    const avatar = await getBlob(avatarUrl, {
      access: getBlobAccessFromUrl(avatarUrl),
    });

    if (!avatar || avatar.statusCode !== 200) {
      return new Response(null, { status: 404 });
    }

    return new Response(avatar.stream, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": avatar.blob.contentType,
      },
    });
  } catch (error) {
    console.error("Avatar delivery failed", error);

    return new Response(null, { status: 404 });
  }
}

export async function PUT(request: Request) {
  const user = await requireApiAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Требуется вход." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Что-то пошло не так." },
      { status: 502 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Некорректные данные для загрузки аватара." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const profileValue = formData.get("profile");

  if (!(file instanceof File)) {
    return Response.json(
      { error: "Выберите изображение для аватара." },
      { status: 400 },
    );
  }

  if (!allowedImageTypes.has(file.type)) {
    return Response.json(
      { error: "Поддерживаются только JPG, PNG и WebP." },
      { status: 400 },
    );
  }

  if (file.size > maxAvatarSizeBytes) {
    return Response.json(
      { error: "Аватар должен быть не больше 5 МБ." },
      { status: 400 },
    );
  }

  if (typeof profileValue !== "string") {
    return Response.json(
      { error: "Профиль не может быть пустым." },
      { status: 400 },
    );
  }

  let profileInput: unknown;

  try {
    profileInput = JSON.parse(profileValue);
  } catch {
    return Response.json(
      { error: "Некорректный JSON профиля." },
      { status: 400 },
    );
  }

  const payload = profileWriteRequestSchema.safeParse({
    profile: profileInput,
  });

  if (!payload.success) {
    return Response.json({ error: payload.error }, { status: 400 });
  }

  try {
    const extension = getExtensionByContentType(file.type);
    const blob = await put(
      `avatars/${encodeURIComponent(user.email)}/avatar.${extension}`,
      file,
      {
        access: "private",
        addRandomSuffix: true,
      },
    );
    const previousAvatarUrl = payload.data.profile.identity.avatarUrl;
    const profile = await saveProfile(user.email, {
      ...payload.data.profile,
      identity: {
        ...payload.data.profile.identity,
        avatarUrl: blob.url,
      },
    });

    await deletePreviousAvatar(previousAvatarUrl, blob.url);

    return Response.json(profile);
  } catch (error) {
    console.error("Avatar upload failed", error);

    return Response.json(
      { error: "Что-то пошло не так." },
      { status: 502 },
    );
  }
}

function getExtensionByContentType(contentType: string) {
  if (contentType === "image/png") {
    return "png";
  }

  if (contentType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function getBlobAccessFromUrl(url: string) {
  return url.includes(".public.blob.vercel-storage.com")
    ? "public"
    : "private";
}

async function deletePreviousAvatar(previousUrl: string, nextUrl: string) {
  if (
    !previousUrl ||
    previousUrl === nextUrl ||
    !previousUrl.includes(".blob.vercel-storage.com")
  ) {
    return;
  }

  try {
    await del(previousUrl);
  } catch {
    // The new profile is already saved, so failed cleanup should not block upload.
  }
}
