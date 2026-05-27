import firebase_app from '../config'
import {
  getFirestore,
  doc,
  getDocs,
  collection,
  query,
} from 'firebase/firestore'

//for courses and enrollment data
export default async function getdocsbyuidseis(uid) {
  if (!firebase_app) {
    return { send: [], error: null }
  }

  const db = getFirestore(firebase_app)
  let result = null
  let error = null
  let send = []
  // let docRef = doc(db, process.env.NEXT_PUBLIC_collection, id)
  // db.settings({ timestampsInSnapshots: true })
  let colref = collection(db, process.env.NEXT_PUBLIC_collection)
  try {
    result = await getDocs(query(colref))
    result.forEach((d) => {
      if (Object.keys(d.data()).includes(uid)) {
        // console.log(d.id, 'vaaaamooo')
        send.push(d.id)
      }
    })
  } catch (e) {
    error = e
  }

  return { send, error }
}
