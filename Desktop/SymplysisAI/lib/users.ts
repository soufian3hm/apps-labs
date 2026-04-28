import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PASSWORD_RESETS_FILE = path.join(DATA_DIR, "password-resets.json");

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  googleId?: string;
  createdAt: string;
}

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf-8");
  if (!fs.existsSync(PASSWORD_RESETS_FILE)) fs.writeFileSync(PASSWORD_RESETS_FILE, "[]", "utf-8");
}

function getUsers(): User[] {
  ensure();
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function saveUsers(users: User[]) {
  ensure();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

interface PasswordResetRecord {
  tokenHash: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

function getPasswordResetRecords(): PasswordResetRecord[] {
  ensure();
  return JSON.parse(fs.readFileSync(PASSWORD_RESETS_FILE, "utf-8"));
}

function savePasswordResetRecords(records: PasswordResetRecord[]) {
  ensure();
  fs.writeFileSync(PASSWORD_RESETS_FILE, JSON.stringify(records, null, 2), "utf-8");
}

function hash(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createUser(name: string, email: string, password: string): User {
  const users = getUsers();
  if (users.some((u) => u.email === email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hash(password, salt),
    salt,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  return user;
}

export function findUserByCredentials(email: string, password: string): User {
  const users = getUsers();
  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) throw new Error("Invalid email or password.");
  if (!user.passwordHash || !user.salt) {
    throw new Error("This account uses Google sign-in. Continue with Google instead.");
  }
  if (hash(password, user.salt) !== user.passwordHash) throw new Error("Invalid email or password.");
  return user;
}

export function findUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find((user) => user.email === email.toLowerCase()) ?? null;
}

export function findOrCreateGoogleUser({
  googleId,
  email,
  name,
}: {
  googleId: string;
  email: string;
  name?: string;
}): User {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase();
  const index = users.findIndex((user) => user.googleId === googleId || user.email === normalizedEmail);

  if (index >= 0) {
    const existing = users[index];
    const updated: User = {
      ...existing,
      email: normalizedEmail,
      googleId,
      name: name?.trim() || existing.name,
    };
    users[index] = updated;
    saveUsers(users);
    return updated;
  }

  const user: User = {
    id: crypto.randomUUID(),
    name: name?.trim() || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    passwordHash: "",
    salt: "",
    googleId,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  return user;
}

export function createPasswordResetToken(email: string): string | null {
  const user = findUserByEmail(email);
  if (!user) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const records = getPasswordResetRecords().filter((record) => {
    if (record.userId === user.id) return false;
    if (record.usedAt) return false;
    return new Date(record.expiresAt).getTime() > now;
  });

  records.push({
    tokenHash: hashToken(token),
    userId: user.id,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 1000 * 60 * 30).toISOString(),
  });

  savePasswordResetRecords(records);
  return token;
}

export function resetPasswordWithToken(token: string, password: string): void {
  const tokenHash = hashToken(token);
  const now = Date.now();
  const records = getPasswordResetRecords();
  const resetRecord = records.find((record) => record.tokenHash === tokenHash);

  if (!resetRecord || resetRecord.usedAt || new Date(resetRecord.expiresAt).getTime() <= now) {
    throw new Error("This password reset link is invalid or has expired.");
  }

  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === resetRecord.userId);
  if (userIndex < 0) {
    throw new Error("This password reset link is invalid or has expired.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  users[userIndex] = {
    ...users[userIndex],
    passwordHash: hash(password, salt),
    salt,
  };
  saveUsers(users);

  savePasswordResetRecords(
    records
      .map((record) =>
        record.tokenHash === tokenHash
          ? { ...record, usedAt: new Date(now).toISOString() }
          : record.userId === resetRecord.userId
            ? { ...record, usedAt: record.usedAt ?? new Date(now).toISOString() }
            : record,
      )
      .filter((record) => new Date(record.expiresAt).getTime() > now || record.usedAt),
  );
}
