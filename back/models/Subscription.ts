import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  nextBillingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
