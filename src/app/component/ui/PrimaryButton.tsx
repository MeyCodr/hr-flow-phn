import React from "react";

interface PrimaryButtonProps {
  type: "submit" | "button" | "reset";
  className: string;
  name: string;
}

function PrimaryButton({ type, className, name }: PrimaryButtonProps) {
  return (
    <button type={type} className={className}>
      {name}
    </button>
  );
}

export default PrimaryButton;
