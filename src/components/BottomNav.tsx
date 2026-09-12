"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Package, User, LogOut, ChevronRight, X } from "lucide-react";
import useBasketStore from "@/app/(store)/store";
import { useAuth, useUser, useClerk, SignInButton } from "@clerk/nextjs";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import Image from "next/image";

export default function BottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { t } = useLanguage();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const navItems = [
    { label: t("home"), href: "/", icon: Home },
    { label: t("search"), href: "/search", icon: Search },
    { label: t("basket"), href: "/basket", icon: ShoppingBag, badge: itemCount },
  ];

  const isOrdersActive = pathname === "/orders";

  return (
    <>
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/92 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] py-1.5 px-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-slate-800"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? "scale-110 stroke-[2.2]" : "stroke-[1.8]"
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2.5 bg-slate-950 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] tracking-tight mt-1 text-center">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-4 h-0.5 bg-slate-950 rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Utilisateur Connecté : Icône Compte qui ouvre la modale/menu */}
          {isSignedIn ? (
            <button
              type="button"
              onClick={() => setAccountMenuOpen(true)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                accountMenuOpen || isOrdersActive
                  ? "text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                {user?.imageUrl ? (
                  <div className="w-5 h-5 rounded-full overflow-hidden ring-1.5 ring-slate-900/20">
                    <Image
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      width={20}
                      height={20}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <User
                    className={`w-5 h-5 transition-transform duration-200 ${
                      accountMenuOpen || isOrdersActive ? "scale-110 stroke-[2.2]" : "stroke-[1.8]"
                    }`}
                  />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 text-center">
                {t("account")}
              </span>
              {(accountMenuOpen || isOrdersActive) && (
                <span className="absolute -bottom-1 w-4 h-0.5 bg-slate-950 rounded-full" />
              )}
            </button>
          ) : (
            /* Utilisateur Non Connecté : Bouton Connexion */
            <SignInButton mode="modal">
              <button
                type="button"
                className="flex flex-col items-center justify-center py-1 px-3 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <User className="w-5 h-5 stroke-[1.8]" />
                <span className="text-[10px] font-medium tracking-tight mt-1 text-center">
                  {t("login")}
                </span>
              </button>
            </SignInButton>
          )}
        </div>
      </nav>

      {/* Menu / Bottom Sheet du Compte Utilisateur sur Mobile */}
      {isSignedIn && accountMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Overlay d'arrière-plan */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
            onClick={() => setAccountMenuOpen(false)}
          />

          {/* Tiroir coulissant */}
          <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl border-t border-slate-200/80 animate-in slide-in-from-bottom-6 duration-200 z-10">
            {/* Poignée de drag visuelle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

            {/* Profil utilisateur & bouton fermeture */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                {user?.imageUrl ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-slate-100 shrink-0">
                    <Image
                      src={user.imageUrl}
                      alt={user.fullName || "Avatar"}
                      width={48}
                      height={48}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-900 truncate">
                    {user?.fullName || user?.firstName || t("account")}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAccountMenuOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Liens du compte */}
            <div className="py-3 space-y-1">
              {/* Mon Profil / Gérer mon compte */}
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  openUserProfile();
                }}
                className="w-full flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">{t("manageAccount")}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Mes Commandes */}
              <Link
                href="/orders"
                onClick={() => setAccountMenuOpen(false)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">{t("myOrders")}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Bouton Se Déconnecter */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100/80 text-rose-600 font-semibold text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

