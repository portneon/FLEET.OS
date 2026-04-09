
import Image from "next/image";
import Link from "next/link"


export default function Home() {
  return (
    <div>
      <div>
        <h1>Hello world this is fleet os</h1>
        <Link href="/login">
          Go to Login
        </Link>
        <Link href="/Signup">
          Go to Signup
        </Link>
        <Link href="/dashboard">
          Go to Dashboard
        </Link>
      </div>

    </div>
  );
}
