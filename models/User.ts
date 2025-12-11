import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash?: string; // Optional because it's null until claimed
  role: 'ORGANIZER' | 'USER';
  assignedMatch?: mongoose.Types.ObjectId;
  isRevealed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: ['ORGANIZER', 'USER'], default: 'USER' },
    assignedMatch: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isRevealed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent overwrite on hot reload
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
