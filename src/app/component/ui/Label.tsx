import React from "react";

interface LabelProps {
  htmlFor: string;
  className: string;
  name: string;
  required?: boolean;
}

function Label({ htmlFor, className, name, required = false }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {name}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export default Label;
