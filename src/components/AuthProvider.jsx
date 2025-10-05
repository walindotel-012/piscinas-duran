// src/components/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth, googleProvider, signInWithPopup, signOut } from '../lib/firebase'; // ✅ Importa signInWithPopup
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verificar si el usuario existe en Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          // Crear usuario en Firestore
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL,
            createdAt: new Date(),
            role: 'admin'
          });
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

 const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider); // ✅ Ahora está definido
    return { success: true };
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    return { success: false, error: error.message };
  }
};
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}