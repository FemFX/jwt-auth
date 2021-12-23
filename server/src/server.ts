import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import indexRoutes from "./routes";
import errorMiddleware from "./middleware/error";

const app = express();

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorMiddleware);

app.use("/", indexRoutes);

const start = () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URL!)
      .then(() => console.log("MongoDB connected..."))
      .catch((err) => console.log(err));
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`Server started on port ${port}`));
  } catch (e) {
    console.log(e);
  }
};
start();
