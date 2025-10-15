import React from "react";

interface InputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
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
}: InputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      className={`border rounded-md px-3 py-2 w-full 
        ${
          disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"
        } 
        ${className}`}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
    />
  );
}

export { Input };
