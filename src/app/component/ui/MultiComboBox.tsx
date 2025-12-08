"use client";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { TiTick } from "react-icons/ti";

interface MultiComboBoxProps {
  menu: { id: string | number; name: string }[];
  onSelect?: (items: { id: string | number; name: string }[]) => void;
  selectedValues?: string[]; // array of selected ids
  disabled?: boolean;
}

export default function MultiComboBox({
  menu,
  onSelect,
  selectedValues = [],
  disabled = false,
}: MultiComboBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<
    { id: string | number; name: string }[]
  >([]);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync selectedValues from parent
  useEffect(() => {
    const items = selectedValues
      .map((val) => menu.find((m) => m.id.toString() === val))
      .filter(Boolean);

    setSelectedItems(items as { id: string | number; name: string }[]);
  }, [selectedValues, menu]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboRef.current &&
        !comboRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMenu =
    query === ""
      ? menu
      : menu.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  const toggleItem = (item: { id: string | number; name: string }) => {
    if (disabled) return;
    const exists = selectedItems.find((i) => i.id === item.id);
    let updated: typeof selectedItems;
    if (exists) {
      updated = selectedItems.filter((i) => i.id !== item.id);
    } else {
      updated = [...selectedItems, item];
    }
    setSelectedItems(updated);
    onSelect?.(updated);
  };
  
  return (
    <div className="w-full relative" ref={comboRef}>
      {!mounted ? (
        <div className="w-full h-10 border border-gray-300 rounded-md bg-gray-50 animate-pulse"></div>
      ) : (
        <Combobox value={null} onChange={() => {}} disabled={disabled}>
          <div className="relative">
            <ComboboxInput
              placeholder="Select approvers"
              displayValue={
                () => selectedItems.map((i) => i.name).join(", ") // <-- show selected names
              }
              onChange={(event) => setQuery(event.target.value)}
              onClick={() => !disabled && setOpen((prev) => !prev)}
              className={`w-full rounded-sm border px-3 py-2 pr-10 text-xs outline-none transition duration-150 ease-in-out
                ${
                  disabled
                    ? "bg-gray-200 cursor-not-allowed border-gray-300 text-black"
                    : "bg-white border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                }`}
            />
            <FaChevronDown
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer transition-transform duration-200
                ${open && !disabled ? "rotate-180" : "rotate-0"}
                ${
                  disabled
                    ? "cursor-not-allowed text-gray-400"
                    : "text-gray-400 hover:text-gray-600"
                }
              `}
              onClick={() => !disabled && setOpen((prev) => !prev)}
            />
          </div>

          {open && !disabled && (
            <ComboboxOptions
              static
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 focus:outline-none"
            >
              {filteredMenu.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-xs">
                  No results found
                </div>
              ) : (
                filteredMenu.map(
                  (item: { id: string | number; name: string }) => {
                    const selectedIndex = selectedItems.findIndex(
                      (i) => i.id === item.id
                    );
                    const selected = selectedIndex !== -1;

                    return (
                      <ComboboxOption
                        key={item.id}
                        value={item.name}
                        className={`cursor-pointer select-none px-3 py-2 text-xs text-gray-700 flex items-center justify-between hover:bg-indigo-100 duration-150 transition-all ease-in-out
            ${selected ? "bg-indigo-200 font-medium hover:bg-indigo-200" : ""}`}
                        onClick={() => toggleItem(item)}
                      >
                        <span>{item.name}</span>

                        {selected && (
                          <span className="flex items-center gap-x-1">
                            <TiTick />
                            <span className="text-[10px] font-semibold">
                              {selectedIndex + 1}
                            </span>
                          </span>
                        )}
                      </ComboboxOption>
                    );
                  }
                )
              )}
            </ComboboxOptions>
          )}
        </Combobox>
      )}
    </div>
  );
}
