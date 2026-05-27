import firebase_app from '../config'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'

export default function listenSummaire(id, callback) {
  if (!firebase_app) {
    callback({ data: null, error: null })
    return () => {}
  }

  const db = getFirestore(firebase_app)
  let docref = doc(db, process.env.NEXT_PUBLIC_collection_summaire, id)
  
  const unsubscribe = onSnapshot(docref, (snap) => {
    if (snap.exists()) {
      callback({ data: snap.data(), error: null })
    } else {
      callback({ data: null, error: new Error('No doc exists') })
    }
  }, (error) => {
    callback({ data: null, error })
  })

  return unsubscribe
}
