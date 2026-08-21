import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Make sure the path matches your client instance location

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session immediately on app mount
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    initializeAuth();

    // 2. Set up real-time listener for runtime login/logout state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth Event Triggered: ${event}`);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Clean up the event stream on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* Optional: Don't render broken UI links while evaluating initial session state */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
