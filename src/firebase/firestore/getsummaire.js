import firebase_app from '../config'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

export default async function getsummaire(id) {
  if (!firebase_app) {
    return { data: null, error: null }
  }

  const db = getFirestore(firebase_app)
  let docref = doc(db, process.env.NEXT_PUBLIC_collection_summaire, id)
  let data = null
  let error = null
  try {
    let snap = await getDoc(docref)
    if (snap.exists()) {
      console.log('dates data for:', id, 'is:', snap.data())
      data = snap.data()
    } else {
      console.log('Nodoc exists')
    }
  } catch (e) {
    error = e
  }
  return { data, error }
}
