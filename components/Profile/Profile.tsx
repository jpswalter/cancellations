// components/Profile.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

const Profile: React.FC<{ popupAlign?: 'top' | 'bottom' }> = ({
  popupAlign = 'top',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { userData } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!userData) return null;

  const popupClassName = clsx(
    'absolute right-0 w-full bg-white rounded-md shadow-lg py-2',
    popupAlign === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
  );

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        className="relative text-md group flex items-center gap-x-3 rounded-md p-2 font-semibold text-gray-700 hover:text-blue-700 focus:outline-none w-full"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <FaUser className="h-6 w-6 shrink-0" aria-hidden="true" />
        <span className="truncate">{userData.email}</span>
      </button>
      {showDropdown && (
        <div ref={dropdownRef} className={popupClassName}>
          <div className="px-4 py-2">
            <div className="flex items-center gap-x-2 text-gray-600">
              <span className="font-bold">{userData.name}</span>
            </div>
            <div className="flex items-center gap-x-2 text-gray-600 mt-1">
              <span>{userData.tenantName}</span>
            </div>
          </div>
          <hr className="my-2" />
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-md text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
