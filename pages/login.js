import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Login Error: ${error.message}`);
    } else {
      alert("Login Successful!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Checkbox */}
      <div
        className="checkbox-container"
        onClick={() => setShowPassword(!showPassword)}
      >
        <label>Show Password</label>
        <input type="checkbox" checked={showPassword} readOnly />
      </div>

      <button onClick={handleLogin}>Login</button>

      <p>
        Don't have an account? <Link href="/signup">Sign Up here</Link>
      </p>
    </div>
  );
}