const express = require("express");
const cors = require("cors");
const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store (optional)
const submissionsLog = [];

app.post("/track", (req, res) => {
  const data = req.body;

  if (!data || !data.username || !data.slug) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  // Console log submission details
  console.log("\n📥 New Submission Received:");
  console.log(`🧑‍💻 Username: ${data.username}`);
  console.log(`📘 Slug: ${data.slug}`);
  console.log(`✅ Verdict: ${data.verdict}`);
  console.log(`📄 Submission ID: ${data.submissionId}`);
  console.log(`🕒 Timestamp: ${data.timestamp}`);
  console.log("📜 Code:\n" + data.code);
  console.log("=".repeat(50));

  // Optionally store in memory
  submissionsLog.push(data);

  res.status(200).json({ message: "Submission logged successfully" });
});

// Optional: to view all logged submissions
app.get("/submissions", (req, res) => {
  res.json(submissionsLog);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
