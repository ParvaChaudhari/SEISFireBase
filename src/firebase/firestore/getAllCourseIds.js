import firebase_app from '../config'
import { getFirestore, getDocs, collection, query } from 'firebase/firestore'

const db = getFirestore(firebase_app)

export default async function getAllCourseIds() {
  let send = []
  let error = null
  let colref = collection(db, process.env.NEXT_PUBLIC_collection)
  
  try {
    const result = await getDocs(query(colref))
    result.forEach((d) => {
      // Exclude legacy 'courses' doc if it exists
      if (d.id !== 'courses') {
        send.push(d.id)
      }
    })
  } catch (e) {
    console.error("Error fetching all course IDs:", e)
    error = e
  }
  
  return { send, error }
}
