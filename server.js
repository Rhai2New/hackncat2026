require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const app = express();
app.use(cors());
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "IdeaSubmission")));


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Bnoska88!",
  database: "idea_app"
});

db.connect(err => {
  if (err) {
    console.log("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

app.get("/ideas", (req, res) => {
  db.query("SELECT * FROM ideas", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to fetch ideas" });
    }
    res.json(result);
  });
});

app.post("/ideas", (req, res) => {
  const { title, problem, solution, audience } = req.body;

  const sql = `
    INSERT INTO ideas (title, problem, solution, audience)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [title, problem, solution, audience], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to save idea" });
    }
    res.json(result);
  });
});

app.post("/reviews", (req, res) => {
  const { idea_id, clarity_score, impact_score, feasibility_score, comment } = req.body;

  const sql = `
    INSERT INTO reviews (idea_id, clarity_score, impact_score, feasibility_score, comment)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [idea_id, clarity_score, impact_score, feasibility_score, comment], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to save review" });
    }
    res.json(result);
  });
});

app.post("/refine-idea", async (req, res) => {
  const { title, audience, problem, solution } = req.body;

  try {
    const prompt = `You are helping refine startup ideas.

Using the information below, write a professional pitch summary in no more than 4 sentences.

Focus on:
- the problem
- the solution
- the target audience
- the value of the idea

Do not invent funding, team details, business model, traction, or competition.

Title: ${title}
Audience: ${audience}
Problem: ${problem}
Solution: ${solution}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    res.json({
      pitchSummary: response.text
    });
  } catch (error) {
    console.error("Gemini refinement failed:", error);
    res.status(500).json({ error: "Failed to refine idea" });
  }
});

app.get("/test-page", (req, res) => {
  res.sendFile(path.join(__dirname, "IdeaSubmission", "index.html"));
});

app.listen(3000, "127.0.0.1", () => {
  console.log("Server running on http://127.0.0.1:3000");
});
