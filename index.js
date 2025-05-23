const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;


const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'https://adrenalineboost.netlify.app' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  optionsSuccessStatus: 200
};


app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(express.json({ extended: true }));


app.options('*', cors(corsOptions));

app.use('/api/auth', require('./routes/auth.route'));

async function start() {
  try {
    await mongoose.connect(
      "mongodb+srv://vadimkostenko:12345@cluster0.2wc6c32.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server has been started on ${PORT}`);
    });
  } catch (e) {
    console.error("Error connecting to MongoDB", e);
    process.exit(1);
  }
}

start();
