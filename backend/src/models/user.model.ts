import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  preferredPersona: 'dad' | 'mom' | 'grandparent' | 'sibling';
  emotionalProfile: {
    dominantEmotion?: string;
    sessionCount: number;
    lastSession?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    preferredPersona: {
      type: String,
      enum: ['dad', 'mom', 'grandparent', 'sibling'],
      default: 'mom',
    },
    emotionalProfile: {
      dominantEmotion: String,
      sessionCount: { type: Number, default: 0 },
      lastSession: Date,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', userSchema);
