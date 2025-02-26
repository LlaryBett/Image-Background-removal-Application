import { Link } from 'react-router-dom';
import { useClerk, useUser, UserButton } from '@clerk/clerk-react';
import { assets } from '../assets/assets';

const Navbar = () => {
  const { openSignIn } = useClerk();
  const { isSignedIn } = useUser();

  return (
    <div className="flex items-center justify-between mx-4 py-3 lg:mx-44">
      {/* Logo */}
      <Link to="/">
        <img className="w-32 sm:w-44" src={assets.logo} alt="Logo" />
      </Link>

      {/* Authentication Button */}
      {isSignedIn ? (
        <UserButton />
      ) : (
        <button 
          type="button"
          onClick={openSignIn}
          className="bg-zinc-800 text-white flex items-center gap-4 px-4 py-2 sm:px-8 sm:py-3 text-sm rounded-full"
        >
          Get Started
          <img className="w-3 sm:w-4" src={assets.arrow_icon} alt="Arrow Icon" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
