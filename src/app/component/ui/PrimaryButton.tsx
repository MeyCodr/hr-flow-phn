import React, { ReactNode } from "react";

interface PrimaryButtonProps {
  type?: "submit" | "button" | "reset"; // optional, default to "button"
  className?: string;
  name: string;
  icon?: ReactNode;
}

function PrimaryButton({
  type = "button",
  className = "",
  name,
  icon,
}: PrimaryButtonProps) {
  return (
    <button type={type} className={`flex items-center gap-2 justify-center ${className}`}>
      {icon && <span>{icon}</span>}
      {name}
    </button>
  );
}

export default PrimaryButton;
