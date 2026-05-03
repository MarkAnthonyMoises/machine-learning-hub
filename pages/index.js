import Link from "next/link";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.log("Session error:", error);
          await supabase.auth.signOut();
        }

        if (session && !session.user.email_confirmed_at) {
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.log("Auth cleanup:", err);
        await supabase.auth.signOut();
      }
    };

    checkSession();
  }, []);

  return (
    <div className="container">
      <h1>Machine Learning Hub</h1>
      <p>Explore machine learning projects and experiments easily!</p>

      <Link href="/signup">
        <button>Sign Up</button>
      </Link>

      <Link href="/login">
        <button>Login</button>
      </Link>
    </div>
  );
}