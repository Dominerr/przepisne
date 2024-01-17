import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

type CustomButtonProps = TouchableOpacityProps & {
  type?: "error" | "primary" | "secondary" | "success";
};

export function CustomButton({
  children,
  className,
  type = "primary",
  ...rest
}: CustomButtonProps) {
  const bgColor = () => {
    switch (type) {
      case "error":
        return "bg-red-500";
      case "success":
        return "bg-emerald-600";
      case "secondary":
        return "bg-emerald-900";
      default:
        return "bg-black";
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className={`items-center rounded-md ${bgColor()} p-2 ${className}`}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}
