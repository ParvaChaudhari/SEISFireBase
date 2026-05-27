import firebase_app from './config'
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth'

export default async function signIn(email, password) {
  if (!firebase_app) {
    return { result: null, error: new Error('Firebase not initialized') }
  }

  const auth = getAuth(firebase_app)

  let result = null,
    error = null
  try {
    result = await signInWithEmailAndPassword(auth, email, password)
  } catch (e) {
    error = e
  }

  return { result, error }
}
