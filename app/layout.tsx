import './globals.css';
import Link from 'next/link';
import Image from 'next/image'; // Import Image from Next.js

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-500 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center"> {/* Added items-center for vertical alignment */}
              <div className="flex items-center"> {/* Flex container for logo and title */}
                <Image
                  src="/atombooks_logo.jpg" // Path to the image in the public folder
                  alt="Atombooks Logo"
                  width={40} // Set the desired width
                  height={40} // Set the desired height
                  className="mr-2" // Add margin to the right for spacing
                />
                <Link href="/" className="text-2xl font-bold">
                  Atombooks Website
                </Link>
              </div>
              <div className="space-x-4">
                <Link href="/">Home</Link>
                <Link href="/videos">Videos</Link>
                <Link href="/sign">Sign In</Link>
              </div>
            </nav>
          </header>
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-gray-200 p-4 text-center">
            © {new Date().getFullYear()} All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}