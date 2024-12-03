// app/page.tsx

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Atom Simple</h1>
        <p className="text-xl">Your Next.js application for interactive story books.</p>
      </header>

      <main className="flex flex-col gap-8 items-center justify-center">
        <Image
          src="/atombooks_logo.svg"
          alt="Atombooks Logo"
          width={180}
          height={180}
          priority
        />
        
        <div className="text-center max-w-2xl">
          <p className="mb-4">
            Atom Simple is a platform for registered users to view exclusive video content.
            Sign up or sign in to access our library of videos.
          </p>
          
          <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
            <Link
              href="/sign"
              className="rounded-full bg-blue-500 text-white px-6 py-2 hover:bg-blue-600 transition-colors"
            >
              Sign Up / Sign In
            </Link>
            <Link
              href="/videos"
              className="rounded-full border border-blue-500 text-blue-500 px-6 py-2 hover:bg-blue-50 transition-colors"
            >
              Browse Videos
            </Link>
          </div>
        </div>
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center text-sm bg-gray-200 p-4 text-center">
        <Link href="/about" className="hover:underline">
          About Us
        </Link>
        <Link href="/contact" className="hover:underline">
          Contact
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}