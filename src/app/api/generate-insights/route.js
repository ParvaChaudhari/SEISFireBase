import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp(); // Fallback to application default credentials
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

const db = admin.firestore();

export async function POST(req) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 1. Fetch summaire data
    const summarySnap = await db.collection('summaire').get();
    
    let summaryText = "";
    
    summarySnap.forEach(doc => {
      const courseId = doc.id;
      const data = doc.data();
      // Get the last 7 dates
      const dates = Object.keys(data).sort().slice(-7);
      const recentData = dates.map(date => `${date}: ${data[date]}`).join(", ");
      summaryText += `\nCourse: ${courseId}\nRecent Enrollment (Last 7 dates): ${recentData}\n`;
    });

    if (!summaryText) {
      return NextResponse.json({ error: 'No summary data found' }, { status: 404 });
    }

    // 2. Call Gemini API
    const prompt = `You are an AI assistant for a university administration dashboard. Analyze the following daily enrollment data for various courses over the last few days.
    
Provide a concise, 3-sentence summary of the trends. Highlight the fastest-growing and shrinking courses if applicable. Use professional, analytical language. DO NOT use markdown, just plain text.

Data:
${summaryText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const insightText = response.text;

    // 3. Save to Firestore
    await db.collection('admin_insights').add({
      text: insightText,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return NextResponse.json({ success: true, insight: insightText });

  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
