// hooks/useAuth.ts
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, database } from '@/lib/firebase/config';
import { User } from '@/lib/db/schema';
import LogRocket from 'logrocket';
import { getFullName } from '@/utils/general';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const logRocketInitialized = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(database, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data() as User;
          const {
            firstName,
            lastName,
            email,
            tenantId,
            tenantName,
            tenantType,
          } = data;
          setUserData(data);

          if (!logRocketInitialized.current) {
            LogRocket.identify(data.id, {
              name: getFullName(firstName, lastName),
              email,
              tenantId,
              tenantName,
              tenantType,
            });
            logRocketInitialized.current = true;
          }
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userData, loading };
}
