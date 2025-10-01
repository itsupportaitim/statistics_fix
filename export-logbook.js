const { MongoClient } = require('mongodb');
const fs = require('fs').promises;

async function exportCollectionToJson() {
  const uri = 'mongodb+srv://logbooker:XC6OBSdpTRibV8At@logbook.g57e0.mongodb.net/?retryWrites=true&w=majority&appName=logbook';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('logbook'); // If your DB name is different, update here
    const collection = db.collection('reports');

    // Fetch all documents (add filters if needed, e.g., { date: { $gte: new Date('2025-07-01') } })
    const documents = await collection.find({}).toArray();
    console.log(`Fetched ${documents.length} documents`);

    // Convert to JSON (pretty-printed)
    const jsonData = JSON.stringify(documents, null, 2);

    // Write to file
    await fs.writeFile('logbook-reports.json', jsonData);
    console.log('Exported to logbook-reports.json');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

exportCollectionToJson();