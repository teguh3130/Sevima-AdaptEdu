import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'

const AuthContext = createContext(null)

function roleKey(uid) {
  return `adaptedu_role_${uid}`
}

async function resolveRole(uid) {
  try {
    const snapshot = await getDoc(doc(db, 'users', uid))
    const role = snapshot.exists() ? snapshot.data()?.role : null
    if (role === 'student' || role === 'teacher') return role
  } catch {
    // rules Firestore mungkin belum mengizinkan baca, pakai fallback lokal
  }
  return localStorage.getItem(roleKey(uid)) || 'student'
}

async function persistRole(uid, role, email) {
  localStorage.setItem(roleKey(uid), role)
  try {
    await setDoc(doc(db, 'users', uid), { role, email }, { merge: true })
  } catch {
    // penyimpanan Firestore gagal tidak menghalangi login
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const role = await resolveRole(firebaseUser.uid)
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          role,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        )
        const role = await resolveRole(credential.user.uid)
        setUser({
          uid: credential.user.uid,
          email: credential.user.email ?? '',
          role,
        })
        return role
      },
      async register(email, password, role) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        )
        await persistRole(credential.user.uid, role, credential.user.email)
        setUser({
          uid: credential.user.uid,
          email: credential.user.email ?? '',
          role,
        })
        return role
      },
      async logout() {
        await signOut(auth)
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
