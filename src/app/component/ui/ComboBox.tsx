"use client";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

interface ComboBoxProps {
  menu: { id: number; name: string }[];
  onSelect?: (item: { id: number; name: string } | null) => void;
  selectedValue?: string | null;
}

export default function ComboBox({
  menu,
  onSelect,
  selectedValue,
}: ComboBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  // filter menu items
  const filteredMenu =
    query === ""
      ? menu
      : menu.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  // close when click outside
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

  // handle selection
  const handleSelect = (value: string | null) => {
    console.log("values: ", value);
    setOpen(false);
    if (value === null) {
      if (onSelect) onSelect(null);
      return;
    }

    // Find the item in the menu, including "-"
    const item = menu.find((i) => i.name === value) || null;
    if (onSelect) onSelect(item);
  };

  // FIXED: Properly display selected value including "-"
  const displayValue = (val: string) => {
    // If val is empty but we have a selectedValue that corresponds to "-" item
    if (
      !val &&
      selectedValue === "" &&
      menu.some((item) => item.name === "-")
    ) {
      return "-";
    }

    // If the selectedValue is the ID (from RegisterForm), find the name
    if (menu.some((item) => item.id.toString() === val)) {
      const item = menu.find((item) => item.id.toString() === val);
      return item ? item.name : "";
    }

    // If it's already the name (like "-"), return it directly
    return val;
  };

  return (
    <div className="w-full relative" ref={comboRef}>
      <Combobox value={selectedValue || ""} onChange={handleSelect}>
        <div className="relative">
          <ComboboxInput
            placeholder="Select an option"
            displayValue={displayValue}
            onChange={(event) => setQuery(event.target.value)}
            onClick={() => setOpen((prev) => !prev)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          />
          <FaChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>

        {open && (
          <ComboboxOptions
            static
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 focus:outline-none"
          >
            {filteredMenu.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No results found
              </div>
            ) : (
              filteredMenu.map((item) => (
                <ComboboxOption
                  key={item.id}
                  value={item.name}
                  className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700 data-[focus]:bg-indigo-100"
                >
                  {item.name}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  );
}
