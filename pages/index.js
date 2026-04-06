import Link from "next/link";

export default function Home() {
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