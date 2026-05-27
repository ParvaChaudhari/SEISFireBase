import firebase_app from '../config'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'

//for enrollment data
export default async function addDataseis(data, id = 'IFT510') {
  if (!firebase_app) {
    return { result: null, error: null }
  }

  const db = getFirestore(firebase_app)
  let result = null
  let error = null
  let k = new Object()
  k[data] = null
  // db.settings({ timestampsInSnapshots: true })
  // console.log(k, typeof k, 'JK ROWLINGGG')
  try {
    await updateDoc(doc(db, process.env.NEXT_PUBLIC_collection, id), k)
    result = true
  } catch (e) {
    error = e
  }

  return { result, error }
}
