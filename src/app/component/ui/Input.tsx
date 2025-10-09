import React from "react";

interface InputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  className: string;
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
  className,
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
      className={className}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
    ></input>
  );
}

export { Input };
