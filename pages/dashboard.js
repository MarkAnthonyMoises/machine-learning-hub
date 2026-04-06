import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
      else router.push('/signup');
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert('You have logged out successfully!');
    router.push('/signup');
  };

  if (!user) return <p style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</p>;

  return (
    <div className="container">
      <h1>Welcome 👋</h1>

      <p className="welcome-text">
        Logged in as:
      </p>

      {/* Highlighted Email */}
      <div className="highlight-email">
        {user.email}
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}