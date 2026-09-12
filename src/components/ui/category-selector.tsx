"use client";

import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useEffect, useState } from "react";
import { Category } from "../../../sanity.types";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { useLanguage } from "@/context/LanguageContext";

interface CategorySelectorProps {
  categories: Category[];
}

export const CategorySelectorComponent = ({
  categories,
}: CategorySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const router = useRouter();
  const { t, translateCategory } = useLanguage();

  // Fermer automatiquement le popover lors du scroll pour éviter qu'il flotte au-dessus du header sticky / navbar
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      setOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  const selectedCategory = categories.find((category) => category._id === value);
  const triggerLabel = selectedCategory
    ? translateCategory(selectedCategory.title, selectedCategory.slug?.current)
    : t("allCategories");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full sm:w-64 justify-between bg-white hover:bg-slate-50 border-slate-200 text-slate-900 font-medium py-2.5 px-4 rounded-xl shadow-xs transition-all'
        >
          <span className='truncate'>{triggerLabel}</span>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 text-slate-400' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        side='bottom'
        sideOffset={6}
        collisionPadding={12}
        className='w-64 p-0 bg-white border border-slate-200 rounded-xl shadow-xl z-30'
      >
        <Command>
          <CommandInput
            placeholder={t("searchCategory")}
            className='h-10 text-sm'
            onKeyDown={(e) => {
              if (e.key === "enter") {
                const found = categories.find((c) =>
                  c.title
                    ?.toLowerCase()
                    .includes(e.currentTarget.value.toLowerCase())
                );
                if (found?.slug?.current) {
                  setValue(found._id);
                  router.push(`/categories/${found.slug.current}`);
                  setOpen(false);
                }
              }
            }}
          />
          <CommandList>
            <CommandEmpty className='py-4 text-center text-xs text-slate-500'>
              {t("noCategoryFound")}
            </CommandEmpty>
            <CommandGroup className='p-1.5'>
              {categories.map((category) => (
                <CommandItem
                  key={category._id}
                  value={category.title}
                  className='cursor-pointer rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors'
                  onSelect={() => {
                    setValue(value === category._id ? "" : category._id);
                    router.push(`/categories/${category.slug?.current}`);
                    setOpen(false);
                  }}
                >
                  {translateCategory(category.title, category.slug?.current)}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 text-slate-900",
                      value === category._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


export default CategorySelectorComponent;

