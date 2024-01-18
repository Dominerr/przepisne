import React from "react";
import { View, Text } from "react-native";
import Home from "../assets/icons/Home";

type TabProps = {
  color: string;
  size: number;
};

const Tab = ({ color, size }: TabProps) => {
  return (
    <View className="items-center">
      <Home width={size} height={size} color={color} />
      <Text>Home</Text>
    </View>
  );
};

export default Tab;
