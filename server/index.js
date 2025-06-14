import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});
import connectDB from "./database/db.js";
import app from "./app.js";
const PORT = process.env.PORT || 3000;
// Connect to the database
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
