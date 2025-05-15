import mongoose from "mongoose";

const connectDB = async () => {
  // Set up connection event listeners
  mongoose.connection.on('connected', () => {
    console.log("MongoDB connection established successfully");
  });

  mongoose.connection.on('error', (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log("MongoDB disconnected");
  });

  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    // Connect to MongoDB - Use the URI directly without appending database name
    console.log(`Attempting to connect to MongoDB with configured URI`);
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    // Don't throw error, let the application continue with degraded functionality
  }
};

export default connectDB;
