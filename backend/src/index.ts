import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

console.log("Contract address:", process.env.CROWDFUND_CONTRACT_ADDRESS);

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Crowdfund API is running" });
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});