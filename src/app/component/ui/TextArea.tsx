import { Textarea } from "@headlessui/react";

interface TextAreaProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  className?: string;
}

function TextArea({
  id,
  name,
  value,
  onChange,
  placeholder,
  className,
}: TextAreaProps) {
  return (
    <Textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    ></Textarea>
  );
}

export { TextArea };
