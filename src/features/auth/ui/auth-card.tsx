"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "@/features/auth/server/actions";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/features/auth/model";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type AuthMode = "login" | "register" | "forgot" | "reset";

export function AuthCard() {
  const searchParams = useSearchParams();
  const mode = getAuthMode(searchParams.get("mode"));
  const token = searchParams.get("token") ?? "";
  const verified = searchParams.get("verified") === "1";
  const failedVerification = searchParams.get("error") === "1";

  return (
    <Card className="w-full max-w-sm shadow-[0_20px_80px_rgba(15,23,42,0.12)]">
      <CardHeader>
        <CardTitle>{getTitle(mode)}</CardTitle>
      </CardHeader>
      <CardContent>
        {verified ? (
          <p className="mb-4 rounded-2xl bg-primary/10 px-3 py-2 text-sm text-primary">
            Почта подтверждена. Теперь можно войти.
          </p>
        ) : null}
        {failedVerification ? (
          <p className="mb-4 rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Ссылка подтверждения недействительна или устарела.
          </p>
        ) : null}
        {mode === "login" ? <LoginForm /> : null}
        {mode === "register" ? <RegisterForm /> : null}
        {mode === "forgot" ? <ForgotPasswordForm /> : null}
        {mode === "reset" ? <ResetPasswordForm token={token} /> : null}
      </CardContent>
    </Card>
  );
}

function LoginForm() {
  const [state, action, pending] = useActionState(
    loginAction,
    initialAuthActionState,
  );

  return (
    <form action={action} className="grid gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input id="login-email" name="email" type="email" autoComplete="email" />
        </Field>
        <Field>
          <FieldLabel htmlFor="login-password">Пароль</FieldLabel>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
          />
        </Field>
      </FieldGroup>
      <AuthMessage state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Вхожу" : "Войти"}
      </Button>
      <div className="flex items-center justify-between gap-3 text-sm">
        <Link className="text-primary hover:underline" href="/auth?mode=register">
          Регистрация
        </Link>
        <Link className="text-muted-foreground hover:text-primary" href="/auth?mode=forgot">
          Забыли пароль?
        </Link>
      </div>
    </form>
  );
}

function RegisterForm() {
  const [state, action, pending] = useActionState(
    registerAction,
    initialAuthActionState,
  );

  if (state.status === "success") {
    return <SuccessMessage message={state.message} />;
  }

  return (
    <form action={action} className="grid gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="register-password">Пароль</FieldLabel>
          <PasswordInput
            id="register-password"
            name="password"
            autoComplete="new-password"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="register-repeat-password">
            Повторите пароль
          </FieldLabel>
          <PasswordInput
            id="register-repeat-password"
            name="repeatPassword"
            autoComplete="new-password"
          />
        </Field>
      </FieldGroup>
      <AuthMessage state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Отправляю" : "Зарегистрироваться"}
      </Button>
      <Link className="text-sm text-primary hover:underline" href="/auth">
        Войти
      </Link>
    </form>
  );
}

function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    initialAuthActionState,
  );

  if (state.status === "success") {
    return <SuccessMessage message={state.message} />;
  }

  return (
    <form action={action} className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
        <Input id="forgot-email" name="email" type="email" autoComplete="email" />
      </Field>
      <AuthMessage state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Отправляю" : "Отправить письмо"}
      </Button>
      <Link className="text-sm text-primary hover:underline" href="/auth">
        Назад
      </Link>
    </form>
  );
}

function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initialAuthActionState,
  );

  if (state.status === "success") {
    return (
      <div className="grid gap-4">
        <SuccessMessage message={state.message} />
        <Button asChild>
          <Link href="/auth">Войти</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reset-password">Новый пароль</FieldLabel>
          <PasswordInput
            id="reset-password"
            name="password"
            autoComplete="new-password"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="reset-repeat-password">
            Повторите пароль
          </FieldLabel>
          <PasswordInput
            id="reset-repeat-password"
            name="repeatPassword"
            autoComplete="new-password"
          />
        </Field>
      </FieldGroup>
      <AuthMessage state={state} />
      <Button type="submit" disabled={pending || !token}>
        {pending ? "Сохраняю" : "Сохранить пароль"}
      </Button>
      <Link className="text-sm text-primary hover:underline" href="/auth">
        Назад
      </Link>
    </form>
  );
}

function AuthMessage({
  state,
}: {
  state: AuthActionState;
}) {
  if (state.status !== "error") {
    return null;
  }

  return (
    <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {state.message}
    </p>
  );
}

function PasswordInput({
  id,
  name,
  autoComplete,
}: {
  id: string;
  name: string;
  autoComplete: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOffIcon : EyeIcon;

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        autoComplete={autoComplete}
        className="pr-11"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={isVisible ? "Скрыть пароль" : "Показать пароль"}
        title={isVisible ? "Скрыть пароль" : "Показать пароль"}
        className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
        onClick={() => setIsVisible((current) => !current)}
      >
        <Icon />
      </Button>
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <p className="rounded-2xl bg-primary/10 px-3 py-2 text-sm text-primary">
      {message}
    </p>
  );
}

function getAuthMode(mode: string | null): AuthMode {
  if (mode === "register" || mode === "forgot" || mode === "reset") {
    return mode;
  }

  return "login";
}

function getTitle(mode: AuthMode) {
  if (mode === "register") {
    return "Регистрация";
  }

  if (mode === "forgot") {
    return "Восстановление пароля";
  }

  if (mode === "reset") {
    return "Новый пароль";
  }

  return "Вход";
}
