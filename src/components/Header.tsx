"use client";

import {
  ClerkLoaded,
  Show,
  SignInButton,
  UserButton,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import Link from "next/link";
import Form from "next/form";
import { Package, ShoppingBag, Search, Sparkles, KeyRound } from "lucide-react";
import useBasketStore from "@/app/(store)/store";
import { useEffect, useState } from "react";
import LanguageSwitch from "./LanguageSwitch";
import { useLanguage } from "@/context/LanguageContext";

const Header = () => {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const handleUserClick = (e: React.MouseEvent) => {
    // Si l'utilisateur clique sur le texte, on déclenche le clic sur l'avatar du UserButton pour ouvrir son popover
    const avatarTrigger = (e.currentTarget.parentElement?.querySelector(".cl-userButtonTrigger") ||
      e.currentTarget.parentElement?.querySelector("button")) as HTMLElement | null;
    if (avatarTrigger) {
      avatarTrigger.click();
    } else {
      openUserProfile();
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const createClerkPasskey = async () => {
    try {
      const response = await user?.createPasskey();
      console.log(response);
    } catch (error) {
      console.log("Error", JSON.stringify(error, null, 2));
    }
  };

  return (
    <header className='sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all'>
      {/* Barre supérieure discrète d'annonce */}
      <div className='bg-slate-950 text-slate-300 text-[10px] sm:text-[11px] font-medium tracking-wider sm:tracking-widest uppercase py-1.5 px-3 sm:px-4 text-center flex items-center justify-center gap-1.5 sm:gap-2'>
        <Sparkles className='w-3 h-3 text-amber-400 shrink-0' />
        <span className='sm:hidden'>{t("topBarShort")}</span>
        <span className='hidden sm:inline'>{t("topBar")}</span>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-4'>
        {/* Logo */}
        <Link
          href='/'
          className='flex items-center gap-2 group shrink-0'
        >
          <div className='w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-lg tracking-tighter shadow-sm group-hover:scale-105 transition-transform duration-200'>
            D
          </div>
          <span className='text-xl sm:text-2xl font-black tracking-tight text-slate-900'>
            DRESS<span className='font-light text-slate-500'>CODE</span>
          </span>
        </Link>

        {/* Barre de recherche desktop et tablette */}
        <Form
          action='/search'
          className='hidden md:flex flex-1 max-w-md mx-4 relative'
        >
          <div className='relative w-full group'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors' />
            <input
              type='text'
              name='query'
              placeholder={t("searchPlaceholder")}
              className='w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none'
            />
          </div>
        </Form>

        {/* Section utilisateur, panier & langue */}
        <div className='flex items-center gap-2 sm:gap-3 shrink-0'>
          {/* Recherche Desktop/Tablette uniquement (caché sur mobile) */}
          <Link
            href='/search'
            className='hidden md:hidden p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors'
            aria-label='Recherche'
          >
            <Search className='w-5 h-5' />
          </Link>

          {/* Panier : icône uniquement avec badge rouge/corail élégant, juste à côté du compte */}
          <Link
            href='/basket'
            className='hidden sm:flex relative items-center justify-center w-9 h-9 rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors shrink-0'
            aria-label={t("basket")}
            title={t("basket")}
          >
            <ShoppingBag className='w-5 h-5 stroke-[2] text-slate-700' />
            {mounted && itemCount > 0 && (
              <span className='absolute -top-0.5 -right-0.5 bg-rose-600 text-white font-bold text-[10px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs leading-none'>
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* User Area Clerk : Compte utilisateur avec commandes intégrées */}
          <ClerkLoaded>
            {user ? (
              <div className='hidden sm:flex items-center gap-2 shrink-0'>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 rounded-full ring-2 ring-slate-200 hover:ring-slate-400 transition-all",
                      avatarBox: "w-8 h-8 rounded-full",
                      userButtonPopoverCard: "shadow-2xl border border-slate-200 rounded-2xl right-0 left-auto",
                      userButtonPopoverRoot: "right-0 left-auto",
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label={t("orders")}
                      labelIcon={<Package className='w-4 h-4' />}
                      href='/orders'
                    />
                  </UserButton.MenuItems>
                </UserButton>
                <button
                  type='button'
                  onClick={handleUserClick}
                  className='hidden xl:block text-left text-xs leading-tight cursor-pointer group/user select-none'
                  title={user.firstName || user.fullName || ""}
                >
                  <p className='text-slate-400 font-medium group-hover/user:text-slate-600 transition-colors'>{t("welcome")}</p>
                  <p className='font-semibold text-slate-800 group-hover/user:text-slate-950 transition-colors truncate max-w-[100px]'>
                    {user.firstName || user.fullName}
                  </p>
                </button>
              </div>
            ) : (
              <div className='hidden sm:block shrink-0'>
                <SignInButton mode='modal'>
                  <button className='px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer'>
                    {t("login")}
                  </button>
                </SignInButton>
              </div>
            )}

            {user && user?.passkeys?.length === 0 && (
              <button
                onClick={createClerkPasskey}
                className='hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-900 text-xs font-medium transition-colors shrink-0'
              >
                <KeyRound className='w-3 h-3 text-amber-600' />
                {t("passkey")}
              </button>
            )}
          </ClerkLoaded>

          {/* Switch de langue FR / EN : Placé tout à droite sans bordure */}
          <LanguageSwitch />
        </div>

      </div>
    </header>
  );
};

export default Header;


