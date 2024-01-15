import React from "react";

import { View, SafeAreaView, Image, Text } from "react-native";

import SignInWithOAuth from "../components/SignInWithOAuth";

export const SignInSignUpScreen = () => {
  return (
    <SafeAreaView className="h-full items-center justify-center gap-y-32">
      <View className="flex items-center justify-center">
        <Image
          source={require("../../../expo/assets/icon.png")}
          style={{ width: 300, height: 300 }}
        />
        <Text className="text-3xl font-bold">Welcome to Przepisne</Text>
        <Text className="text-xl italic ">Your one stop shop for recipes</Text>
      </View>
      <View className="w-full items-center p-4">
        <SignInWithOAuth />
      </View>
    </SafeAreaView>
  );
};
