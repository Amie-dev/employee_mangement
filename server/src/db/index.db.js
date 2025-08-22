import mongoose from 'mongoose';
import { DB_NAME } from '../utils/name.constends.js';

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log('DB Connect succesfull ');
  } catch (error) {
    console.log(`DB Connections failed error: ${error}`);
    process.exit(1);
  }
};


export default connectDB
