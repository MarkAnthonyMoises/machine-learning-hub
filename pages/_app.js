// pages/_app.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import "../styles/globals.css"; // your global CSS

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Check existing session on load
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // 2️⃣ Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      // Only protect certain routes
      const protectedRoutes = ["/dashboard", "/profile"]; // add more if needed
      if (!user && protectedRoutes.includes(router.pathname)) {
        router.push("/signup"); // redirect unauthenticated users
      }
    }
  }, [user, loading, router.pathname]);

  // Optional: show loading screen while checking session
  if (loading) return <div>Loading...</div>;

  return <Component {...pageProps} />;
}