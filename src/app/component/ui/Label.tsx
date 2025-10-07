import React from "react";

interface LabelProps {
  htmlFor: string;
  className: string;
  name: string;
}

function Label({ htmlFor, className, name }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {name}
    </label>
  );
}

export default Label;
