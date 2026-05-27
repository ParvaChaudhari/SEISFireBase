import firebase_app from '../config'
import { getFirestore, getDocs, collection, query } from 'firebase/firestore'

export default async function getAllCourseIds() {
  let send = []
  let error = null

  if (!firebase_app) {
    // Running on server during prerender/build — return empty result instead of throwing.
    return { send, error }
  }

  const db = getFirestore(firebase_app)
  const colref = collection(db, process.env.NEXT_PUBLIC_collection)

  try {
    const result = await getDocs(query(colref))
    result.forEach((d) => {
      if (d.id !== 'courses') {
        send.push(d.id)
      }
    })
  } catch (e) {
    console.error('Error fetching all course IDs:', e)
    error = e
  }

  return { send, error }
}
