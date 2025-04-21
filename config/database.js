const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;

    await mongoose.connect(dbURI);
    console.log(`MongoDB conectado correctamente a ${mongoose.connection.name}`);
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);

    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;