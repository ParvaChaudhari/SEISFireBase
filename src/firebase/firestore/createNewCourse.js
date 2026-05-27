import firebase_app from '../config'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

export default async function createNewCourse(courseId) {
  if (!firebase_app) {
    return { result: null, error: null }
  }

  const db = getFirestore(firebase_app)
  let result = null
  let error = null

  try {
    // 1. Create the course document in the enrollments collection
    // We add a dummy field 'active: true' to ensure the document exists
    await setDoc(doc(db, process.env.NEXT_PUBLIC_collection, courseId), {
      active: true
    })

    // 2. Create the course document in the summary collection so it shows up in analysis
    // We initialize it with today's date and 0 enrollment
    const today = new Date().toISOString().substring(0, 10)
    const initialSummary = {}
    initialSummary[today] = 0

    await setDoc(doc(db, process.env.NEXT_PUBLIC_collection_summaire, courseId), initialSummary)
    
    result = true
  } catch (e) {
    console.error("Error creating new course:", e)
    error = e
  }

  return { result, error }
}
