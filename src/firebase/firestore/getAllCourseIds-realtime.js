import firebase_app from '../config'
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore'

const db = getFirestore(firebase_app)

export default function listenAllCourseIds(callback) {
  let colref = collection(db, process.env.NEXT_PUBLIC_collection)
  
  const unsubscribe = onSnapshot(query(colref), (snapshot) => {
    let send = []
    snapshot.forEach((d) => {
      // Exclude legacy 'courses' doc if it exists
      if (d.id !== 'courses') {
        send.push(d.id)
      }
    })
    callback({ send, error: null })
  }, (error) => {
    console.error("Error listening to course IDs:", error)
    callback({ send: [], error })
  })

  return unsubscribe
}
