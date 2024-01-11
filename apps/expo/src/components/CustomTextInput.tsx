import React, { forwardRef } from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";

type CustomTextInputProps = TextInputProps & {
  error?: boolean;
  errorMessage?: string;
  label?: string;
};

export const CustomTextInput = forwardRef<TextInput, CustomTextInputProps>(
  ({ error, errorMessage, label, ...props }, ref) => {
    return (
      <View className="w-full space-y-2">
        {label && (
          <Text className="text-sm font-medium leading-none">{label}</Text>
        )}
        <View className="mb-2">
          <TextInput
            ref={ref}
            className="rounded border border-gray-300 p-2 text-black focus:border-gray-500"
            {...props}
          />
          {error && (
            <Text className="text-sm font-medium leading-none text-red-500">
              {errorMessage}
            </Text>
          )}
        </View>
      </View>
    );
  },
);

CustomTextInput.displayName = "CustomTextInput";
