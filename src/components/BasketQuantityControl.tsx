"use client";

import useBasketStore from "@/app/(store)/store";
import { Product } from "../../sanity.types";
import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

interface AddToBasketButtonProps {
  product: Product;
  size?: string;
  disabled?: boolean;
  disableToast?: boolean;
}

const AddToBasketButton = ({ product, size, disabled, disableToast = false }: AddToBasketButtonProps) => {
  const addItem = useBasketStore((state) => state.addItem);
  const removeItem = useBasketStore((state) => state.removeItem);
  const { t } = useLanguage();
  const itemCount = useBasketStore((state) => {
    if (size !== undefined) {
      return (
        state.items.find(
          (item) => item.product._id === product._id && item.size === size
        )?.quantity ?? 0
      );
    }
    return state.items
      .filter((item) => item.product._id === product._id)
      .reduce((acc, item) => acc + item.quantity, 0);
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleAdd = () => {
    addItem(product, size);
    if (!disableToast) {
      const newCount = itemCount + 1;
      const sizeLabel = size ? ` (${size})` : "";
      const toastId = `basket-${product._id}-${size || "default"}`;
      toast.success(t("notifAdded"), {
        id: toastId,
        description: `x${newCount} ${product.name || ""}${sizeLabel}`,
      });
    }
  };

  const handleRemove = () => {
    removeItem(product._id, size);
    const newCount = itemCount - 1;
    const sizeLabel = size ? ` (${size})` : "";
    const toastId = `basket-${product._id}-${size || "default"}`;

    if (newCount > 0) {
      if (!disableToast) {
        toast.info(t("basket"), {
          id: toastId,
          description: `x${newCount} ${product.name || ""}${sizeLabel}`,
        });
      }
    } else {
      // Toujours notifier la suppression complète de l'article
      toast.info(t("notifRemoved"), {
        id: toastId,
        description: `${product.name || ""}${sizeLabel}`,
      });
    }
  };

  if (itemCount === 0) {
    return (
      <button
        type='button'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAdd();
        }}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 shadow-xs ${
          disabled
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-slate-950 hover:bg-slate-800 active:scale-95 text-white hover:shadow-md cursor-pointer"
        }`}
      >
        <Plus className='w-3.5 h-3.5 stroke-[2.5]' />
        <span>{t("add")}</span>
      </button>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className='inline-flex items-center bg-white border border-slate-200/90 rounded-lg p-0.5 shadow-2xs gap-1'
    >
      <button
        type='button'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRemove();
        }}
        aria-label='Retirer un article'
        className='w-6 h-6 rounded-md flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors active:scale-95 cursor-pointer'
      >
        <Minus className='w-3 h-3 stroke-[2.5]' />
      </button>

      <span className='w-5 text-center font-bold text-xs text-slate-900 select-none'>
        {itemCount}
      </span>

      <button
        type='button'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAdd();
        }}
        disabled={disabled}
        aria-label='Ajouter un article'
        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors active:scale-95 ${
          disabled
            ? "bg-slate-100 text-slate-300 cursor-not-allowed"
            : "bg-slate-950 hover:bg-slate-800 text-white cursor-pointer"
        }`}
      >
        <Plus className='w-3 h-3 stroke-[2.5]' />
      </button>
    </div>
  );
};

export default AddToBasketButton;

