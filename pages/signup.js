import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

 const handleSignUp = async () => {
  if (!email || !password || !confirmPassword) {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // ✅ CASE 1: real error from Supabase
  if (error) {
    alert(`Sign-Up Error: ${error.message}`);
    return;
  }

  // ✅ CASE 2: email already exists (IMPORTANT FIX)
  if (data?.user && data.user.identities?.length === 0) {
    alert("This email is already registered. Please login instead.");
    return;
  }

  // save into profiles table (only for new users)
  if (data?.user) {
    const username = email.split("@")[0];

    await supabase.from("profiles").insert([
      {
        id: data.user.id,
        email: data.user.email,
        username: username,
      },
    ]);
  }

  alert("Sign-Up Successful! Redirecting to login...");
  router.push("/login");
};

  return (
    <div className="container">
      <h1>Sign-Up</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type={
          showPassword
            ? "text"
            : "password"
        }
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <input
        type={
          showPassword
            ? "text"
            : "password"
        }
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(
            e.target.value
          )
        }
      />

      <div className="checkbox-container">
        <label>
          Show Password
        </label>

        <input
          type="checkbox"
          checked={showPassword}
          onChange={() =>
            setShowPassword(
              !showPassword
            )
          }
        />
      </div>

      <button
        onClick={handleSignUp}
      >
        Sign Up
      </button>

      <p>
        Already have an account?{" "}
        <Link href="/login">
          Login here
        </Link>
      </p>
    </div>
  );
}