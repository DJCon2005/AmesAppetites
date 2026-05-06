const {MongoClient} = require("mongodb");

const url = "mongodb+srv://24benhurley_db_user:Admin3924@amesappetites.dbjrcos.mongodb.net/?appName=AmesAppetites";
const dbName="AmesAppetites";

let client;
let db;

async function connectDB(){
    if(db) return db;

    client = new MongoClient(url);
    await client.connect();
    db = client.db(dbName);

    console.log("Connected to MongoDB");
    return db;
}

function getDB(){
    if(!db) throw new Error("Database not initialized, call connectDB first.");
    return db
}

module.exports = {connectDB, getDB};