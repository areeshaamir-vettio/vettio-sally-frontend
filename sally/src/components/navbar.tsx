import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="w-full h-14 bg-white flex items-center justify-between px-6">
      {/* Left Side - Logo */}
      <div className="flex items-center">
        <Link href="/" className="text-xl font-semibold text-black">
          Vettio
        </Link>
      </div>


      {/* Right Side - Auth Buttons */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/login"
          className="text-gray-700 hover:text-black transition-colors"
        >
          Login
        </Link>
        <Link 
          href="/signup"
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}
