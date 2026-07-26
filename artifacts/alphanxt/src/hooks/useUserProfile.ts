import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/lib/userService';
import { useState, useEffect } from 'react';

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { 
      setProfileLoading(false); 
      return; 
    }
    
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref,
      (snap) => { 
        setProfile(snap.exists() ? snap.data() as UserProfile : null); 
        setProfileLoading(false); 
      },
      (err) => { 
        setProfileError(err.message); 
        setProfileLoading(false); 
      }
    );
    return unsub;
  }, [user]);

  return { profile, profileLoading, profileError };
}
