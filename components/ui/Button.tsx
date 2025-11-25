import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'secondary', 
  icon, 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg border font-medium text-sm transition-all duration-200 flex items-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-accent text-bg-primary border-accent hover:bg-accent-dark hover:shadow-[0_5px_15px_rgba(0,231,255,0.3)]",
    secondary: "bg-bg-tertiary text-white border-[#252540] hover:border-accent hover:text-accent hover:-translate-y-0.5",
    danger: "bg-bg-tertiary text-red-400 border-red-900 hover:bg-red-900/20 hover:border-red-500",
    ghost: "bg-transparent border-transparent text-gray-400 hover:text-accent"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Hover sheen effect */}
      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500 group-hover:left-full pointer-events-none" />
      
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};