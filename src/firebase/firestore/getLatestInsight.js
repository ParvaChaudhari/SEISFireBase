import firebase_app from '../config'
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'

export default function listenLatestInsight(callback) {
  if (!firebase_app) {
    callback({ insight: null, error: null })
    return () => {}
  }

  const db = getFirestore(firebase_app)
  const colref = collection(db, 'admin_insights')
  
  // Get the most recent insight
  const q = query(colref, orderBy('timestamp', 'desc'), limit(1))
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data()
      callback({ insight: data.text, error: null })
    } else {
      callback({ insight: null, error: null })
    }
  }, (error) => {
    console.error('Error listening to insights:', error)
    callback({ insight: null, error })
  })

  return unsubscribe
}
