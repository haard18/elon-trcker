import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the connection across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for each connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('elon-tracker');
}

export async function getTweetsCollection() {
  const db = await getDatabase();
  return db.collection('tweets');
}
export async function deleteAllTweets() {
  const collection = await getTweetsCollection();
  return collection.deleteMany({});
  
}
export async function deletePollState() {
  const db = await getDatabase();
  const pollStateCollection = db.collection('poll_state');
  return pollStateCollection.deleteMany({});
}

export default clientPromise;
