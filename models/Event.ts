import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  giftLimit: number;
  organizerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'COMPLETED'],
      default: 'DRAFT',
    },
    giftLimit: { type: Number, default: 0 },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
