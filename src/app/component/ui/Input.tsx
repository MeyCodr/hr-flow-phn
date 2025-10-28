import React, { useEffect, useRef } from "react";

interface InputProps {
  id: string;
  name: string;
  type: string;
  placeholder?: string;
  className?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

function Input({
  id,
  name,
  type,
  placeholder,
  className = "",
  value,
  onChange,
  required,
  disabled = false,
  autoComplete = "off",
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent scroll wheel increment for number inputs
  useEffect(() => {
    const input = inputRef.current;
    if (input && type === "number") {
      const handleWheel = (e: WheelEvent) => e.preventDefault();
      input.addEventListener("wheel", handleWheel, { passive: false });
      return () => input.removeEventListener("wheel", handleWheel);
    }
  }, [type]);

  return (
    <input
      ref={inputRef}
      id={id}
      name={name} // <-- use the actual name here
      type={type}
      placeholder={placeholder}
      className={`border rounded-md px-3 py-2 w-full
    ${disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"}
    ${className}`}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      style={type === "number" ? { MozAppearance: "textfield" } : undefined}
    />
  );
}

export { Input };
