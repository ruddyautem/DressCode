"use client";

import {
  ClerkLoaded,
  SignedIn,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import Form from "next/form";
import { PackageIcon, TrolleyIcon } from "@sanity/icons";
import useBasketStore from "@/app/(store)/store";

const Header = () => {
  const { user } = useUser();
  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const createClerkPasskey = async () => {
    try {
      const response = await user?.createPasskey();
      console.log(response);
    } catch (error) {
      console.log("Error", JSON.stringify(error, null, 2));
    }
  };

  return (
    <header className='flex flex-wrap justify-center sm:justify-between px-4 py-2 '>
      {/* Container centré */}
      <div className='flex flex-wrap w-full items-center justify-center sm:justify-between gap-4'>
        {/* Logo */}
        <Link
          href='/'
          className='text-2xl font-bold text-blue-500 hover:opacity-50 cursor-pointer'
        >
          DressCode
        </Link>

        {/* Barre de recherche */}
        <Form action='/search' className='w-full sm:w-auto sm:flex-1 min-w-64'>
          <input
            type='text'
            name='query'
            placeholder='Rechercher des articles'
            className='bg-gray-100 text-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border w-full max-w-4xl'
          />
        </Form>

        {/* Section utilisateur & panier */}
        <div className='flex flex-wrap justify-center items-center gap-4 mx-auto'>
          {/* Panier */}
          <Link
            href='/basket'
            className='relative flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            <TrolleyIcon width={24} height={24} />
            <span className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
              {itemCount}
            </span>
            <span>Panier</span>
          </Link>

          {/* User Area */}
          <ClerkLoaded>
            <SignedIn>
              <Link
                href='/orders'
                className='relative flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              >
                <PackageIcon width={24} height={24} />
                <span>Commandes</span>
              </Link>
            </SignedIn>

            {user ? (
              <div className='flex items-center space-x-2'>
                <UserButton />
                <div className='hidden sm:block text-xs'>
                  <p className='text-gray-400'>Bienvenue</p>
                  <p className='font-bold'>{user.fullName}</p>
                </div>
              </div>
            ) : (
              <SignInButton mode='modal' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer'>Se Connecter</SignInButton>
            )}

            {user?.passkeys.length === 0 && (
              <button
                onClick={createClerkPasskey}
                className='bg-white hover:bg-blue-700 hover:text-white animate-pulse text-blue-500 font-bold py-2 px-4 rounded border-blue-300 border'
              >
                Créer un Passkey
              </button>
            )}
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
};

export default Header;
