// components/ui/FormInput.tsx
'use client';

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormInput = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false
}: FormInputProps) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-black">
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-black rounded mt-1 focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

export default FormInput;