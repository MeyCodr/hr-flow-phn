import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";

interface DropdownProps {
  title: string; // default text
  menu: { id: number; name: string }[];
  selected?: string; // currently selected name
  onSelect?: (item: { id: number; name: string }) => void;
  className?: string;
}

export default function Dropdown({
  menu,
  title,
  onSelect,
  className,
  selected
}: DropdownProps) {
  return (
    <Menu as="div" className={`relative inline-block  ${className}`}>
      <MenuButton className="inline-flex w-full justify-center items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50">
        {selected || title} {/* show selected or default */}
        <FaChevronDown
          aria-hidden="true"
          className="-mr-1 size-4  text-black"
        />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5"
      >
        <div className="py-1">
          {menu.map((item) => (
            <MenuItem key={item.id}>
              <button
                type="button"
                onClick={() => onSelect?.(item)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {item.name}
              </button>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
