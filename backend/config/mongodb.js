const { MongoClient } = require("mongodb");

const url = "mongodb+srv://dillon_conrad:Admin5626@amesappetites.dbjrcos.mongodb.net/?appName=AmesAppetites";
const dbName = "AmesAppetites";

let cachedClient = null;
let cachedDb = null;
let connectingPromise = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  if (!connectingPromise) {
    const client = new MongoClient(url, {
      maxPoolSize: 10,
      minPoolSize: 0,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000
    });

    connectingPromise = client.connect().then((connectedClient) => {
      cachedClient = connectedClient;
      cachedDb = connectedClient.db(dbName);
      console.log("Connected to MongoDB");
      return cachedDb;
    }).catch((err) => {
      connectingPromise = null;
      throw err;
    });
  }

  return connectingPromise;
}

function getDB() {
  if (!cachedDb) {
    throw new Error("Database not initialized, call connectDB first.");
  }
  return cachedDb;
}

module.exports = { connectDB, getDB };
