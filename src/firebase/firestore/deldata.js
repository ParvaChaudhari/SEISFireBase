import firebase_app from '../config'
import { getFirestore, doc, updateDoc, deleteField } from 'firebase/firestore'

//for enrollment data
export default async function delDataseis(data, id = 'IFT510') {
  if (!firebase_app) {
    return { result: null, error: null }
  }

  const db = getFirestore(firebase_app)
  let result = null
  let error = null
  let k = new Object()
  k[data] = deleteField()
  // db.settings({ timestampsInSnapshots: true })
  // console.log(k, typeof k, 'JK ROWLINGGG', 'deleteionnn')
  try {
    await updateDoc(doc(db, process.env.NEXT_PUBLIC_collection, id), k)
    result = true
  } catch (e) {
    error = e
  }

  return { result, error }
}
