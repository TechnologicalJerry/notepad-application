import { FilterQuery } from "mongoose";
import UserModel, { UserDocument, UserInput } from "../models/user.model";

export async function createUser(input: UserInput) {
  try {
    const user = await UserModel.create(input);
    return user;
  } catch (e: any) {
    throw new Error(e.message || e);
  }
}

export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await UserModel.findOne({ email });

  if (!user) {
    return null;
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) return null;

  return user;
}

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

export async function findUserById(id: string) {
  return UserModel.findById(id);
}

export async function findUser(query: FilterQuery<UserDocument>) {
  return UserModel.findOne(query);
}
