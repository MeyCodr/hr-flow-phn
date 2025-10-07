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
}

function Input({ id, name, type, placeholder, className, value, onChange, required }: InputProps) {
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
    ></input>
  );
}

export { Input };
