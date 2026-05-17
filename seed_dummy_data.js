const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize only if not already initialized (to prevent errors if script re-runs)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const COLL_ENROLLMENTS = "enrollments";
const COLL_SUMMARY = "summary";

function generateDummyUids(count) {
  const uids = [];
  for (let i = 0; i < count; i++) {
    uids.push(`dummy_uid_${Math.random().toString(36).substring(2, 10)}`);
  }
  return uids;
}

function generateTrendData(startCount, maxGrowth) {
  const data = {};
  let currentCount = startCount;
  const today = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().substring(0, 10);
    
    const growth = Math.floor(Math.random() * maxGrowth);
    currentCount += growth;
    data[dateStr] = currentCount;
  }
  return data;
}

async function seed() {
  console.log("Starting massive dummy data seeding...");

  // The comprehensive list of 20 courses (5 existing + 15 new)
  const courses = [
    // Original 5
    'CS101-Intro', 'CS202-Data-Science', 'ENG101-Writing', 'IT 450', 'MATH301-Calculus',
    // 15 New
    'ART101-Drawing', 'BIO201-Anatomy', 'BUS301-Marketing', 'CHEM101-General', 
    'ECO201-Micro', 'HIST101-World', 'PHYS101-Physics', 'PSY101-Psychology', 
    'SOC101-Sociology', 'CS301-Algorithms', 'CS401-AI', 'ENG201-Literature',
    'MATH401-Stats', 'MUS101-Theory', 'PHIL101-Ethics'
  ];

  for (const courseId of courses) {
    console.log(`Seeding data for course: ${courseId}`);

    // Generate random students, ensuring it never goes above 95
    const studentCount = Math.floor(Math.random() * 50) + 15; // 15 to 65 students
    const dummyUids = generateDummyUids(studentCount);
    
    const enrollData = {
      active: true
    };
    dummyUids.forEach(uid => {
      enrollData[uid] = null;
    });

    // Write dummy students to enrollments collection (this OVERWRITES previous data)
    await db.collection(COLL_ENROLLMENTS).doc(courseId).set(enrollData);

    // Generate 30 days of growth summary data for the chart
    // We end up roughly near `studentCount` at the end
    const startCount = Math.max(0, studentCount - 30);
    const trendData = generateTrendData(startCount, 2); 
    
    // Ensure the last date matches the exact student count
    const todayStr = new Date().toISOString().substring(0, 10);
    trendData[todayStr] = studentCount;

    // Write summary data to summary collection (this OVERWRITES previous data)
    await db.collection(COLL_SUMMARY).doc(courseId).set(trendData);

    console.log(`Successfully seeded ${studentCount} students and 30-day trend for ${courseId}`);
  }

  console.log("Massive dummy data seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Error seeding data:", err);
  process.exit(1);
});
