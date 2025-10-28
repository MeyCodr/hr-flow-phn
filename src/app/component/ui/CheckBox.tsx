import { Checkbox } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckBoxProps {
  checked: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export default function CheckBox({
  checked,
  onChange,
  className,
  disabled,
}: CheckBoxProps) {
  return (
    <Checkbox
      checked={checked}
      onChange={disabled ? () => {} : onChange} // ✅ prevent changes if disabled
      className={`relative flex items-center justify-center w-4 h-4 border-2 cursor-pointer 
        transition-colors duration-200 ${className}
        ${
          checked
            ? "bg-indigo-800 border-indigo-800"
            : "bg-white border-gray-300"
        }
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
        ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <AnimatePresence>
        {checked && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute w-4 h-4 text-white"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M3 7L6 10L11 3"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </Checkbox>
  );
}
