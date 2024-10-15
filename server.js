const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Mongoose connection
mongoose.connect('mongodb://127.0.0.1:27017/personal_budget', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});

// Define the schema for the "budget" collection
const budgetSchema = new mongoose.Schema({
  myBudget: [
    {
      title: { type: String, required: true },
    budget: { type: Number, required: true },
    color: { type: String, required: true }  // Add color field
    }
  ]
});

// Define the Mongoose model based on the schema
const Budget = mongoose.model('Budget', budgetSchema, 'budget'); // Make sure to use the correct collection name

app.use("/", express.static("public"));

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.get("/budget", async (req, res) => {
  try {
    console.log("Fetching budget data...");
    const budgetData = await Budget.findOne(); // Fetch the first document
    if (!budgetData || !budgetData.myBudget) {
      return res.status(404).json({ error: "No budget data found" });
    }
    console.log("Budget data retrieved:", budgetData.myBudget);
    res.json(budgetData.myBudget); // Send the 'myBudget' array to the frontend
  } catch (err) {
    console.error("Error fetching budget data:", err);
    res.status(500).json({ error: "Failed to fetch budget data" });
  }
});

// POST endpoint to add a new budget entry
app.post("/add-budget", async (req, res) => {
  const { title, budget } = req.body;

  // Basic validation to ensure both fields are present
  if (!title || !budget || typeof budget !== 'number') {
    return res.status(400).json({ error: "Invalid data. Please provide a title and a budget (number)." });
  }

  try {
    const budgetData = await Budget.findOne();

    if (!budgetData) {
      // If no document exists, create a new one with the initial entry
      const newBudgetEntry = new Budget({
        myBudget: [{ title, budget, color }]
      });
      await newBudgetEntry.save();
    } else {
      // If a document exists, push the new entry to the 'myBudget' array and save it
      budgetData.myBudget.push({ title, budget });
      await budgetData.save();
    }

    res.status(201).json({ message: "New budget entry added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add budget data" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API served at http://localhost:${port}`);
});