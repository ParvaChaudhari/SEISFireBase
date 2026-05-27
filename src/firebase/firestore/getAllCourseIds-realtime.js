import firebase_app from '../config'
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore'

export default function listenAllCourseIds(callback) {
  if (!firebase_app) {
    // Server-side: no-op listener during prerender/build
    callback({ send: [], error: null })
    return () => {}
  }

  const db = getFirestore(firebase_app)
  const colref = collection(db, process.env.NEXT_PUBLIC_collection)

  const unsubscribe = onSnapshot(query(colref), (snapshot) => {
    let send = []
    snapshot.forEach((d) => {
      if (d.id !== 'courses') {
        send.push(d.id)
      }
    })
    callback({ send, error: null })
  }, (error) => {
    console.error('Error listening to course IDs:', error)
    callback({ send: [], error })
  })

  return unsubscribe
}
