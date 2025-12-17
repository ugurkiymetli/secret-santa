import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatch {
  giver: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  isRevealed: boolean;
  giverRevealedDate?: Date;
}

export interface IEvent extends Document {
  name: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  giftLimit: number;
  giftDate?: Date;
  organizerId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  matches: IMatch[];
  createdAt: Date;
  updatedAt: Date;
  matchDate?: Date;
}

const MatchSchema = new Schema(
  {
    giver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRevealed: { type: Boolean, default: false },
    giverRevealedDate: { type: Date },
  },
  { _id: false }
);

const EventSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "COMPLETED"],
      default: "DRAFT",
    },
    giftLimit: { type: Number, default: 0 },
    giftDate: { type: Date, default: null },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    matches: [MatchSchema],
    matchDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Force model recompilation if schema changed (development only hack, or just standard for Next.js hot reload with schema changes)
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Event;
}

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
