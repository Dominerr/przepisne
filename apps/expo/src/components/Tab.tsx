import React, { useEffect, useRef } from "react";
import { Animated, View, Text } from "react-native";
import Home from "../assets/icons/Home";

type TabProps = {
  focused: boolean;
  color: string;
  size: number;
};

const Tab = ({ focused, color, size }: TabProps) => {
  const opacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  console.log(opacity);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: focused ? 1 : 0,
      duration: 20000,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View className="items-center">
      <Home width={size} height={size} color={color} />
      <Animated.Text style={{ opacity }}>Home</Animated.Text>
    </View>
  );
};

export default Tab;
