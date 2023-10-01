import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

dotenv.config();

const MONGO_OPTIONS = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  socketTimeoutMS: 20000,
  autoIndex: false,
  retryWrites: false,
};

const MONGO_URI = process.env.MONGO_URI || "undefined";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(MONGO_URI, MONGO_OPTIONS);
    console.log(`MongoDB Connected: ${connect.connection.host}`.blue.underline);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
