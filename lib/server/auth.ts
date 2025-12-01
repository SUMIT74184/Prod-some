"use server";

import { getDb } from "@/lib/db";
import type { User } from "@/lib/types";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

async function getUserCollection() {
  const db = await getDb();
  return db.collection<User>("users");
}

export async function login(email: string, password: string): Promise<User | null> {
  const users = await getUserCollection();
  const existingUser = await users.findOne({ email });

  if (existingUser) {
    // @ts-ignore
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (passwordMatch) {
      const { password, _id, ...userWithoutPassword } = existingUser;
      return {
        id: _id.toString(),
        ...userWithoutPassword,
      } as User;
    }
  }
  return null;
}

export async function signup(email: string, password: string, name: string): Promise<User | null> {
  const users = await getUserCollection();
  const existingUser = await users.findOne({ email });

  if (existingUser) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await users.insertOne({
    _id: new ObjectId(),
    email,
    name,
    password: hashedPassword,
    provider: "email",
    createdAt: new Date().toISOString(),
  });

  if (result.acknowledged) {
    const newUser: User = {
      id: result.insertedId.toString(),
      email,
      name,
      provider: "email",
      createdAt: new Date().toISOString(),
    };
    return newUser;
  }

  return null;
}