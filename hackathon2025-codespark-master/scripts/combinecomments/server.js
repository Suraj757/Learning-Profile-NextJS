const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB Connection URI 
const uri = const myVariable = process.env.MONGOURI;
const dbName = 'alpha'; // Replace with your database name
const studioComments = 'GameComment'; // Replace with your collection name
const studioGame = 'StudioLevel'
let db; // To hold the database object once connected

// Connect to MongoDB
async function connectToMongo() {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);

  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process if connection fails
  }
}

// Middleware to parse JSON bodies
app.use(express.json());

// API endpoint to query the collection with a filter
app.get('/api/studio', async (req, res) => {
  try {
    const games = db.collection(studioGame);
    const comments = db.collection(studioComments);
    //Filter the comments for the gameid of the query string(e.g, /api/studio?game=OmMuoiLveI)
    const { gameid } = req.query;
    let query = {};
    let gameQuery = {}

    if (gameid) {
      query.gameId = gameid;
      gameQuery._id = gameid;
    }

    const gameSpecificComments = await comments.find(query).toArray();
    const gameResults = await games.find(gameQuery).toArray();
    if (gameResults.length > 1) {
      throw new Error("Multiple games found by the id", gameQuery);
    }
    const game = gameResults[0];

    const finalGame = combineComments(game, gameSpecificComments)



    res.json(finalGame);

  } catch (err) {
    console.error('Error querying MongoDB:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function combineComments(game, comments) {
  let results = {}


  //Copy the results into a new struct
  results._id = game._id
  results.name = game.name
  results.blueprintName = game.blueprintName
  results.hasCodeChange = game.hasCodeChange
  results.numCodeChanges = game.numCodeChanges
  results.fileFormatVersion = game.fileFormatVersion
  results.dataFile = game.dataFile
  results.template = game.template


  //This will store the number of times each commentID shows up
  const commentIdCounts = {};

  for (const comment of comments){
    // Check if the current struct has a 'commentIds' array and if it's actually an array
    if (comment.commentIds && Array.isArray(comment.commentIds)) {
      // Iterate through each ID within the 'commentIds' array
      for (const id of comment.commentIds) {
        // If the ID is already a key in commentIdCounts, increment its value
        // Otherwise, initialize it to 1
        commentIdCounts[id] = (commentIdCounts[id] || 0) + 1;
      }
    }
  }

  results.commentIdCounts = commentIdCounts

  return results
}

// Start the server
async function startServer() {
  await connectToMongo();
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

startServer();
