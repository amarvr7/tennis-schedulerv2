#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('../tennis-scheduler-v2-firebase-adminsdk-fbsvc-a3577e2c43.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

const validSurfaceTypes = ['Hard', 'Clay', 'Red Clay', 'Indoor'];

async function addLocation(name, surfaceType) {
  const now = new Date();
  
  const docRef = await db.collection('locations').add({
    name: name,
    surfaceType: surfaceType,
    createdAt: admin.firestore.Timestamp.fromDate(now),
    updatedAt: admin.firestore.Timestamp.fromDate(now),
  });
  
  return docRef.id;
}

async function addLocationsFromJSON(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!Array.isArray(data)) {
      throw new Error('JSON file must contain an array of locations');
    }
    
    console.log(`📂 Found ${data.length} locations to add...`);
    
    for (let i = 0; i < data.length; i++) {
      const location = data[i];
      
      if (!location.name || !location.surfaceType) {
        console.log(`⚠️  Skipping invalid location at index ${i}: missing name or surfaceType`);
        continue;
      }
      
      if (!validSurfaceTypes.includes(location.surfaceType)) {
        console.log(`⚠️  Skipping location "${location.name}": invalid surface type "${location.surfaceType}"`);
        continue;
      }
      
      try {
        const id = await addLocation(location.name, location.surfaceType);
        console.log(`✅ Added: ${location.name} (${location.surfaceType}) - ID: ${id}`);
      } catch (error) {
        console.log(`❌ Failed to add "${location.name}": ${error.message}`);
      }
    }
    
    console.log('\n🎾 Bulk import completed!');
    
  } catch (error) {
    console.error('❌ Error reading or processing file:', error.message);
    process.exit(1);
  }
}

// Sample locations for demo
const sampleLocations = [
  { name: "Court 1", surfaceType: "Hard" },
  { name: "Court 2", surfaceType: "Hard" },
  { name: "Clay Court A", surfaceType: "Clay" },
  { name: "Clay Court B", surfaceType: "Clay" },
  { name: "Indoor Court 1", surfaceType: "Hard" },
  { name: "Roland Garros", surfaceType: "Red Clay" }
];

function createSampleFile() {
  const samplePath = path.join(__dirname, 'sample-locations.json');
  fs.writeFileSync(samplePath, JSON.stringify(sampleLocations, null, 2));
  console.log(`📝 Created sample file: ${samplePath}`);
  console.log('Edit this file and run: node add-locations-bulk.js sample-locations.json');
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node add-locations-bulk.js <json-file>');
  console.log('       node add-locations-bulk.js --create-sample');
  console.log('');
  console.log('JSON format example:');
  console.log('[');
  console.log('  { "name": "Court 1", "surfaceType": "Hard" },');
  console.log('  { "name": "Clay Court", "surfaceType": "Clay" }');
  console.log(']');
  console.log('');
  console.log('Valid surface types: Hard, Clay, Red Clay, Indoor');
  process.exit(1);
}

if (args[0] === '--create-sample') {
  createSampleFile();
} else {
  const filePath = path.resolve(args[0]);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  addLocationsFromJSON(filePath);
} 