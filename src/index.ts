import "reflect-metadata";
import { DataSource } from "typeorm";
import express from "express";
import cors from "cors";
import { config } from "dotenv"; // added
import { User } from "./entity/User";
import { Product } from "./entity/Product";
import { Cart } from "./entity/Cart";
import { createUserRouter } from "./controllers/UserController";
import { createProductRouter } from "./controllers/ProductController";  // added
import { createCartRouter } from "./controllers/CartController";        // added
import { createGenerateTextRouter } from "./controllers/GenerateTextController";

config(); // added

const app = express();
app.use(cors());
app.use(express.json());

// Configure SQLite DataSource
const dataSource = new DataSource({
  type: "sqlite",
  database: process.env.DATABASE_FILE as string, // Use environment variable
  entities: [User, Product, Cart], // Register all entities
  synchronize: true, // Auto-create database schema (for development only)
  logging: true, // Enable query logging (optional)
});

// Initialize the connection
dataSource.initialize()
  .then(async () => {
    console.log("Connected to the database");

    // Mounted UserController endpoints instead of inline endpoints
    app.use("/users", createUserRouter(dataSource));
    app.use("/products", createProductRouter(dataSource));  // added
    app.use("/carts", createCartRouter(dataSource));        // added

    // Mount generate text endpoint from controller
    app.use("/generate-text", createGenerateTextRouter(dataSource));

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch(error => console.log(error));