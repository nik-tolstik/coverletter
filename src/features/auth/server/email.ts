import "server-only";

import { headers } from "next/headers";

import { getEmailFromAddress, getResend } from "@/shared/api/resend";
import {
  getConfiguredAppOrigin,
  getVercelAppOrigin,
} from "@/shared/lib/app-origin";

export async function sendVerificationEmail(email: string, token: string) {
  const url = await buildAuthUrl(`/auth/verify?token=${encodeURIComponent(token)}`);

  await sendAuthEmail({
    to: email,
    subject: "Подтверждение почты Coverletter",
    html: `
      <p>Здравствуйте!</p>
      <p>Подтвердите почту для входа в Coverletter:</p>
      <p><a href="${url}">Подтвердить почту</a></p>
      <p>Если вы не создавали аккаунт, просто проигнорируйте это письмо.</p>
    `,
    text: `Подтвердите почту для входа в Coverletter: ${url}`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = await buildAuthUrl(
    `/auth?mode=reset&token=${encodeURIComponent(token)}`,
  );

  await sendAuthEmail({
    to: email,
    subject: "Сброс пароля Coverletter",
    html: `
      <p>Здравствуйте!</p>
      <p>Чтобы задать новый пароль, откройте ссылку:</p>
      <p><a href="${url}">Задать новый пароль</a></p>
      <p>Если вы не запрашивали сброс, просто проигнорируйте это письмо.</p>
    `,
    text: `Чтобы задать новый пароль, откройте ссылку: ${url}`,
  });
}

async function sendAuthEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resend = getResend();

  if (!resend) {
    throw new Error("Resend не настроен.");
  }

  const { error } = await resend.emails.send({
    from: getEmailFromAddress(),
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error("Письмо не отправлено.");
  }
}

async function buildAuthUrl(path: string) {
  const requestHeaders = await headers();
  const origin =
    getConfiguredAppOrigin() ??
    requestHeaders.get("origin") ??
    buildOriginFromHeaders(requestHeaders) ??
    getVercelAppOrigin() ??
    "http://localhost:3000";

  return new URL(path, origin).toString();
}

function buildOriginFromHeaders(requestHeaders: Headers) {
  const host = requestHeaders.get("host");

  if (!host) {
    return undefined;
  }

  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}`;
}
