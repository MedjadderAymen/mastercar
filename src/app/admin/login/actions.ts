"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function adminLogin(username: string, password: string): Promise<LoginResult> {
  if (!username?.trim() || !password) {
    return { ok: false, error: "Enter your username and password." };
  }

  const admin = await prisma.admin.findUnique({ where: { username: username.trim() } });
  if (!admin) {
    return { ok: false, error: "Invalid username or password." };
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return { ok: false, error: "Invalid username or password." };
  }

  const token = await createSessionToken({ adminId: admin.id, username: admin.username });
  await setSessionCookie(token);

  return { ok: true };
}
