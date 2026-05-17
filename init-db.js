const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
    console.error("❌ ERROR: 'serviceAccountKey.json' not found!");
    console.log("Please download it from Firebase Console and place it in this folder.");
    process.exit(1);
}

const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seed() {
  console.log("🚀 Seeding courses into Firestore...");
  
  const courses = ['CS101-Intro', 'CS202-Data-Science', 'MATH301-Calculus', 'ENG101-Writing'];
  
  for (const id of courses) {
    // Add to alerts collection
    await db.collection('alerts').doc(id).set({ description: `Alerts for ${id}` });
    // Add to enrollments collection
    await db.collection('enrollments').doc(id).set({ description: `Enrollment for ${id}` });
  }

  console.log("✅ Successfully created 4 courses!");
  console.log("👉 Now refresh your app and check the dropdowns.");
  process.exit();
}

seed();
