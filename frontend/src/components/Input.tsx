import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...rest }, ref) => {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">{label}</label>

        <input
          ref={ref}
          {...rest}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
        />

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

export default Input;
