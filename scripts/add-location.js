#!/usr/bin/env node

const admin = require('firebase-admin');
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
  try {
    // Validate inputs
    if (!name) {
      throw new Error('Location name is required');
    }
    
    if (!validSurfaceTypes.includes(surfaceType)) {
      throw new Error(`Surface type must be one of: ${validSurfaceTypes.join(', ')}`);
    }

    const now = new Date();
    
    const docRef = await db.collection('locations').add({
      name: name,
      surfaceType: surfaceType,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      updatedAt: admin.firestore.Timestamp.fromDate(now),
    });
    
    console.log(`✅ Location added successfully with ID: ${docRef.id}`);
    console.log(`📍 Name: ${name}`);
    console.log(`🎾 Surface: ${surfaceType}`);
    
  } catch (error) {
    console.error('❌ Error adding location:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node add-location.js <name> <surfaceType>');
  console.log('');
  console.log('Surface types: Hard, Clay, Red Clay, Indoor');
  console.log('');
  console.log('Examples:');
  console.log('  node add-location.js "Court 1" Hard');
  console.log('  node add-location.js "Roland Garros" "Red Clay"');
  console.log('  node add-location.js "Wimbledon Center Court" Hard');
  process.exit(1);
}

const [name, surfaceType] = args;

// Add the location
addLocation(name, surfaceType); 