import mongoose from 'mongoose';

export default async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required for DATA_SOURCE=mongodb');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000, autoIndex: false });
}
