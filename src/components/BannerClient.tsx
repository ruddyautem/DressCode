"use client";
 
import { useState } from "react";
 
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
 
interface BannerClientProps {
  sale: {
    title?: string;
    description?: string;
    couponCode?: string;
    discountAmount?: number;
  };
}
 
export default function BannerClient({ sale }: BannerClientProps) {
  const [copied, setCopied] = useState(false);
  const { t, language } = useLanguage();
 
  // Adaptation du code et du titre selon la langue choisie :
  // En français : code HIVER et titre Soldes d'Hiver
  // Pour les autres langues : code WINTER et titre Winter Sale
  const isWinterPromo =
    sale.couponCode?.toUpperCase() === "HIVER" ||
    sale.couponCode?.toUpperCase() === "WINTER" ||
    sale.title?.toLowerCase().includes("hiver") ||
    sale.title?.toLowerCase().includes("winter");

  const code = isWinterPromo
    ? language === "fr"
      ? "HIVER"
      : "WINTER"
    : (sale.couponCode && sale.couponCode.trim()) || "HIVER";

  const displayTitle = isWinterPromo
    ? t("winterSales")
    : sale.title || t("privilegeOffer");

  const displayDesc = isWinterPromo
    ? language === "en"
      ? t("winterSalesDesc")
      : sale.description || "Faites-vous plaisir pendant les fêtes !"
    : sale.description || "";

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(t("codeCopied"), {
      description: code,
    });

    setTimeout(() => setCopied(false), 2500);
  };

  const discount = sale.discountAmount || 30;
 
  return (
    <div className="w-full">
      {/* Version Mobile : Barre en une seule ligne dans le style épuré du site (gris clair slate-100) */}
      <div className="sm:hidden bg-slate-100/95 border border-slate-200/90 rounded-xl py-2 px-3 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-950 text-white text-[9px] font-black tracking-wider uppercase shrink-0">
            -{discount}%
          </span>
          <span className="text-[11px] font-bold text-slate-800 truncate">
            {displayTitle}
          </span>
        </div>

        {/* Bouton code promo interactif en une ligne */}
        <button
          type="button"
          onClick={copyCode}
          aria-label={code}
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
            copied
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-white border-slate-200 text-slate-900 shadow-2xs hover:bg-slate-50"
          }`}
        >
          <span className="text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
            {copied ? (language === "fr" ? "Copié !" : "Copied!") : "Code"}
          </span>
          <span className="tracking-widest uppercase text-[11px]">
            {code}
          </span>
        </button>
      </div>

      {/* Version Tablette & Desktop : Design complet aéré et prestigieux */}
      <div className="hidden sm:flex bg-slate-100/90 rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-8 md:p-10 xl:p-12 2xl:p-14 shadow-xs text-center flex-col items-center justify-center gap-4 md:gap-5 relative overflow-hidden">
        {/* Badge Titre */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-950 text-white text-[11px] sm:text-xs xl:text-sm font-bold tracking-widest uppercase shadow-xs">
            {displayTitle}
          </span>
        </div>

        {/* Montant Réduction */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl font-black text-slate-900 tracking-tight">
          -{discount}% {t("discountOff")}
        </h2>

        {/* Description */}
        {displayDesc && (
          <p className="text-xs sm:text-sm md:text-base xl:text-lg text-slate-600 font-normal max-w-md md:max-w-xl xl:max-w-2xl mx-auto leading-relaxed">
            {displayDesc}
          </p>
        )}

        {/* Coupon élégant centré avec code cliquable direct */}
        <div className="pt-1 flex items-center justify-center">
          <button
            type="button"
            onClick={copyCode}
            aria-label={code}
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
              copied
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-slate-200 text-slate-900 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${copied ? "text-emerald-100" : "text-slate-400"}`}>
              {copied ? (language === "fr" ? "Copié !" : "Copied!") : "Code"}
            </span>
            <span className="font-mono font-black text-sm sm:text-base tracking-widest uppercase">
              {code}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}