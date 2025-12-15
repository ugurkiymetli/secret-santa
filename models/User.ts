import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  name: string; // Real name of the user
  passwordHash?: string | null; // Optional because it's null until claimed
  isActivated: boolean;
  role: "ORGANIZER" | "USER";
  createdBy?: string | null; // ID of the organizer who created this user
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, default: null },
    isActivated: { type: Boolean, default: false },
    role: { type: String, enum: ["ORGANIZER", "USER", "SUPER_ADMIN"], default: "USER" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
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
