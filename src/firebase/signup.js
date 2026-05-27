import firebase_app from './config'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'

export default async function signUp(email, password) {
  if (!firebase_app) {
    return { result: null, error: new Error('Firebase not initialized') }
  }

  const auth = getAuth(firebase_app)

  let result = null,
    error = null
  try {
    result = await createUserWithEmailAndPassword(auth, email, password)
  } catch (e) {
    error = e
  }

  return { result, error }
}
