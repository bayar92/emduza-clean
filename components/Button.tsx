import React from "react";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export default function Button({ onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className="bg-blue-500 text-white p-2 rounded">
      {children}
    </button>
  );
}
