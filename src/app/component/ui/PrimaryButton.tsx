import React, { ReactNode, MouseEventHandler } from "react";

interface PrimaryButtonProps {
  type?: "submit" | "button" | "reset"; // optional, default to "button"
  className?: string;
  name: string;
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>; // <-- add this
  disabled?: boolean;
}

function PrimaryButton({
  type = "button",
  className = "",
  name,
  icon,
  onClick, 
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`flex items-center gap-2 justify-center ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span>{icon}</span>}
      {name}
    </button>
  );
}

export default PrimaryButton;
