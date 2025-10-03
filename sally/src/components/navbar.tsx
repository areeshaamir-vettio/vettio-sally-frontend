import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <nav className="w-full h-14 bg-white flex items-center justify-between px-6">
      {/* Left Side - Logo */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-black">
          <Image
            src="/assets/vettio-logo.png"
            alt="Vettio Logo"
            width={25}
            height={25}
            className="object-contain"
          />
          Vettio
        </Link>
      </div>


      {/* Right Side - Auth Buttons */}
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-[#8952E0] text-white px-4 py-2 rounded-md hover:bg-[#7A47CC] transition-colors"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}
