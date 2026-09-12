"use client";

import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Drapeaux SVG vectoriels nets et soignés
const FrenchFlag = () => (
  <svg
    className="w-6 h-4.5 rounded-sm shadow-xs overflow-hidden shrink-0 border border-slate-200/80"
    viewBox="0 0 640 480"
  >
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#fff" d="M0 0h640v480H0z" />
      <path fill="#00267f" d="M0 0h213.3v480H0z" />
      <path fill="#f11818" d="M426.7 0H640v480H426.7z" />
    </g>
  </svg>
);

const UKFlag = () => (
  <svg
    className="w-6 h-4.5 rounded-sm shadow-xs overflow-hidden shrink-0 border border-slate-200/80"
    viewBox="0 0 640 480"
  >
    <path fill="#012169" d="M0 0h640v480H0z" />
    <path
      fill="#FFF"
      d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 64V0h75z"
    />
    <path
      fill="#C8102E"
      d="m424 288 216 161v31h-40L380 320l44-32zM640 0v10l-200 150h40L640 40V0zM0 480v-10l200-150h-40L0 440v40zm0-480v10l200 150h-40L0 40V0z"
    />
    <path fill="#FFF" d="M240 0v480h160V0H240zM0 160v160h640V160H0z" />
    <path fill="#C8102E" d="M272 0v480h96V0h-96zM0 192v96h640V192H0z" />
  </svg>
);

const languages = [
  { code: "fr", label: "Français", Flag: FrenchFlag },
  { code: "en", label: "English", Flag: UKFlag },
] as const;

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];
  const CurrentFlag = currentLang.Flag;

  // Fermer le menu lors d'un clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fermer le menu avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative shrink-0 select-none" ref={dropdownRef}>
      {/* Bouton déclencheur épuré : juste drapeau et chevron */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
        aria-label={`Langue : ${currentLang.label}`}
      >
        <CurrentFlag />
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-slate-800" : ""
          }`}
        />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl border border-slate-200/90 shadow-lg p-1 z-50 animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right"
        >
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            const FlagComponent = lang.Flag;

            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-slate-100 text-slate-950 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FlagComponent />
                  <span>{lang.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

