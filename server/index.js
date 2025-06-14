import dotenv from "dotenv";
import connectDB from "./database/db.js";

dotenv.config({
  path: "./.env",
});
import app from "./app.js";
const PORT = process.env.PORT || 3000;
// Connect to the database
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
