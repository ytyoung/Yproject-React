import express from "express";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  user: "postgres",
  host: "141.147.164.232",  // 네 오라클 인스턴스 IP
  database: "postgres",
  password: "keitadmin1",
  port: 5432,
});

const app = express();
app.use(express.json());

app.get("/api/test", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});

app.listen(8080, () => {
  console.log("✅ Backend server running on port 8080");
});