import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  name: string; // Real name of the user
  passwordHash?: string; // Optional because it's null until claimed
  role: "ORGANIZER" | "USER";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: ["ORGANIZER", "USER"], default: "USER" },
  },
  { timestamps: true }
);

// Prevent overwrite on hot reload
// Force model recompilation if schema changed
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.User;
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
