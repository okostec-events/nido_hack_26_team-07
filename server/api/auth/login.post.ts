import { createError, readBody } from "h3";
import {
  createSessionForUser,
  normalizeEmail,
  verifyPassword,
} from "../../utils/auth";
import { ensureSchema, getDb } from "../../utils/db";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

type LoginRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  arrival_month: string;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event);

  const rawEmail = typeof body.email === "string" ? body.email : "";
  const rawPassword = typeof body.password === "string" ? body.password : "";

  const email = normalizeEmail(rawEmail);
  const password = rawPassword.trim();

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }

  await ensureSchema();
  const db = getDb();

  const rows = await db<LoginRow[]>`
    SELECT u.id, u.email, u.password_hash, p.name, p.arrival_month
    FROM users u
    INNER JOIN user_profiles p ON p.user_id = u.id
    WHERE u.email = ${email}
    LIMIT 1
  `;

  const user = rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  await createSessionForUser(event, user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      arrivalMonth: user.arrival_month,
    },
  };
});
