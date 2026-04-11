import { createError, readBody } from "h3";
import {
  createSessionForUser,
  createUserId,
  hashPassword,
  normalizeEmail,
} from "../../utils/auth";
import { ensureSchema, getDb } from "../../utils/db";

type RegisterBody = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  arrivalMonth?: unknown;
};

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event);

  const rawEmail = typeof body.email === "string" ? body.email : "";
  const rawPassword = typeof body.password === "string" ? body.password : "";
  const rawName = typeof body.name === "string" ? body.name : "";
  const rawArrivalMonth =
    typeof body.arrivalMonth === "string" ? body.arrivalMonth : "";

  const email = normalizeEmail(rawEmail);
  const password = rawPassword.trim();
  const name = rawName.trim() || "New user";
  const arrivalMonth = rawArrivalMonth.trim() || "Not set";

  if (!isValidEmail(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please provide a valid email address",
    });
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must have at least 6 characters",
    });
  }

  await ensureSchema();
  const db = getDb();

  const existing = await db<{ id: string }[]>`
    SELECT id
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

  if (existing.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "An account with this email already exists",
    });
  }

  const userId = createUserId();
  const passwordHash = hashPassword(password);

  await db.begin(async (transaction) => {
    await transaction`
      INSERT INTO users (id, email, password_hash)
      VALUES (${userId}, ${email}, ${passwordHash})
    `;

    await transaction`
      INSERT INTO user_profiles (user_id, name, arrival_month)
      VALUES (${userId}, ${name}, ${arrivalMonth})
    `;
  });

  await createSessionForUser(event, userId);

  return {
    user: {
      id: userId,
      email,
      name,
      arrivalMonth,
    },
  };
});
