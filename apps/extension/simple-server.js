// Simple Express server for extension testing
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage
const submissions = [];

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Store submission
app.post('/api/v1/submissions', (req, res) => {
  try {
    const submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    submissions.push(submission);
    console.log(`📝 New submission: ${submission.title} (${submission.difficulty})`);
    
    res.json({ 
      success: true, 
      id: submission.id,
      message: 'Submission stored successfully'
    });
  } catch (error) {
    console.error('❌ Error storing submission:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get submissions
app.get('/api/v1/submissions', (req, res) => {
  res.json({ 
    success: true, 
    data: submissions 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Extension server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
