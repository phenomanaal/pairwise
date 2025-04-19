'use client';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'disabled';
  fullWidth?: boolean;
}

const Button = ({
  type = 'button',
  onClick,
  disabled = false,
  children,
  variant = 'primary',
  fullWidth = false,
}: ButtonProps) => {
  const baseClasses =
    'py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-black';
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300',
    disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || variant === 'disabled'}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`}
    >
      {children}
    </button>
  );
};

export default Button;
