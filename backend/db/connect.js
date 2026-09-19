'use strict';

const mongoose = require('mongoose');
const config = require('../config');

async function connect() {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connect: connect, mongoose: mongoose };
