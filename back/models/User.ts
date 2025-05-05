import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  expoPushToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  expoPushToken: {
    type: String,
    default: null,
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
