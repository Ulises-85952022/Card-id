import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
  verifyPasswordResetCode,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

const AuthContext = createContext(null);

/**
 * Sesión de Firebase Auth para el panel. Firebase guarda la sesión en el navegador
 * (persistencia local por defecto), así que al recargar `isLoading` pasa a false
 * solo cuando ya se conoce si hay usuario.
 *
 * Los métodos lanzan el error original de Firebase; la pantalla lo traduce con
 * `getAuthErrorMessage` (ver authMessages.js).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      }),
    []
  );

  const session = useMemo(
    () =>
      user
        ? {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            lastSignInTime: user.metadata?.lastSignInTime ?? null,
          }
        : null,
    [user]
  );

  const saveProfile = (uid, data) => setDoc(doc(db, "users", uid), data, { merge: true });

  const signInWithPassword = async (email, password) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUpWithPassword = async (email, password, { fullName, companyName }) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(newUser, { displayName: fullName.trim() });
    await saveProfile(newUser.uid, {
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      email: newUser.email,
      createdAt: serverTimestamp(),
    });
    // Best effort: si el correo de verificación falla, la cuenta ya quedó creada
    sendEmailVerification(newUser).catch(() => {});
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(auth, provider);
    if (getAdditionalUserInfo(credential)?.isNewUser) {
      await saveProfile(credential.user.uid, {
        fullName: credential.user.displayName ?? "",
        companyName: "",
        email: credential.user.email,
        provider: "google",
        createdAt: serverTimestamp(),
      });
    }
  };

  const sendPasswordResetEmail = (email) => firebaseSendPasswordResetEmail(auth, email.trim());

  /** Confirma que el enlace del correo sigue vigente y devuelve el correo al que pertenece. */
  const verifyResetCode = (oobCode) => verifyPasswordResetCode(auth, oobCode);

  /**
   * Con `oobCode` (enlace del correo) fija la contraseña sin sesión.
   * Sin él, cambia la contraseña del usuario que ya inició sesión.
   */
  const updatePassword = (newPassword, { oobCode } = {}) => {
    if (oobCode) return confirmPasswordReset(auth, oobCode, newPassword);
    if (!auth.currentUser) {
      const error = new Error("No hay una sesión activa.");
      error.code = "auth/no-current-user";
      return Promise.reject(error);
    }
    return firebaseUpdatePassword(auth.currentUser, newPassword);
  };

  const signOut = () => firebaseSignOut(auth);

  const value = {
    user,
    session,
    isLoading,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    sendPasswordResetEmail,
    verifyResetCode,
    updatePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}
