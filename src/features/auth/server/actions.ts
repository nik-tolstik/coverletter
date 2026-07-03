"use server";

import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import {
  createEmailVerificationToken,
  createPasswordResetToken,
  registerAuthUser,
  resetPasswordByToken,
} from "@/entities/auth/server";

import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "./email";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = readCredentials(formData);

  if (!credentials.email || !credentials.password) {
    return {
      status: "error",
      message: "Укажите email и пароль.",
    };
  }

  const result = await signIn("credentials", {
    email: credentials.email,
    password: credentials.password,
    redirect: false,
    redirectTo: "/",
  });

  if (typeof result === "string" && result.includes("error=")) {
    return {
      status: "error",
      message: "Неверный email, пароль или почта не подтверждена.",
    };
  }

  redirect("/");
}

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = readCredentials(formData);
  const repeatedPassword = readFormString(formData, "repeatPassword");

  if (!credentials.email || !credentials.password || !repeatedPassword) {
    return {
      status: "error",
      message: "Заполните все поля.",
    };
  }

  if (!isValidEmail(credentials.email)) {
    return {
      status: "error",
      message: "Укажите корректный email.",
    };
  }

  if (credentials.password.length < 8) {
    return {
      status: "error",
      message: "Пароль должен быть не короче 8 символов.",
    };
  }

  if (credentials.password !== repeatedPassword) {
    return {
      status: "error",
      message: "Пароли не совпадают.",
    };
  }

  try {
    const user = await registerAuthUser(credentials.email, credentials.password);
    const token = await createEmailVerificationToken(user.email);

    await sendVerificationEmail(user.email, token);

    return {
      status: "success",
      message: "Письмо подтверждения отправлено. Это окно можно закрыть.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Регистрация не выполнена.",
    };
  }
}

export async function forgotPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email");

  if (!email || !isValidEmail(email)) {
    return {
      status: "error",
      message: "Укажите корректный email.",
    };
  }

  try {
    const token = await createPasswordResetToken(email);

    if (token) {
      await sendPasswordResetEmail(email, token);
    }

    return {
      status: "success",
      message: "Письмо отправлено. Это окно можно закрыть.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Письмо не отправлено.",
    };
  }
}

export async function resetPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const token = readFormString(formData, "token");
  const password = readFormString(formData, "password");
  const repeatedPassword = readFormString(formData, "repeatPassword");

  if (!token || !password || !repeatedPassword) {
    return {
      status: "error",
      message: "Заполните все поля.",
    };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "Пароль должен быть не короче 8 символов.",
    };
  }

  if (password !== repeatedPassword) {
    return {
      status: "error",
      message: "Пароли не совпадают.",
    };
  }

  const user = await resetPasswordByToken(token, password);

  if (!user) {
    return {
      status: "error",
      message: "Ссылка недействительна или устарела.",
    };
  }

  return {
    status: "success",
    message: "Пароль обновлён. Теперь можно войти.",
  };
}

function readCredentials(formData: FormData) {
  return {
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
  };
}

function readFormString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
