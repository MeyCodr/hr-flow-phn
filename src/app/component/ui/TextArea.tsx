import { Textarea } from "@headlessui/react";

interface TextAreaProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean; // ✅ add disabled prop
  rows?: number;
}

function TextArea({
  id,
  name,
  value,
  onChange,
  placeholder,
  className,
  disabled = false, // default to false
  rows
}: TextAreaProps) {
  return (
    <Textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled} // ✅ apply disabled
      className={`${className} ${
        disabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : ""
      }`}
    ></Textarea>
  );
}

export { TextArea };
