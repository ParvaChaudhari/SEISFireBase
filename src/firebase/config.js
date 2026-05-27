// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  authDomain: process.env.NEXT_PUBLIC_authDomain,
  projectId: process.env.NEXT_PUBLIC_projectId,
  storageBucket: process.env.NEXT_PUBLIC_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
  appId: process.env.NEXT_PUBLIC_appId,
}

// Only initialize Firebase in the browser. This prevents server-side
// prerendering/build steps from attempting to initialize the client SDK
// when environment variables (API key) are not available in CI.
let firebase_app = null
if (typeof window !== 'undefined') {
  firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
}

export default firebase_app
