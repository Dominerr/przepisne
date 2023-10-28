import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomeScreen } from "../screens/home";
import { Header } from "./Header";
import { DiscoverScreen } from "../screens/discover";
import Home from "../assets/icons/Home";
import Search from "../assets/icons/Search";

export type RootParamList = {
  Test: undefined;
  Home: { paramA: string };
  Discover: undefined;
};

const Tab = createBottomTabNavigator<RootParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          header: () => <Header />,
          tabBarActiveTintColor: "blue",
          tabBarIcon: ({ color, size }) => (
            <Home width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          header: () => <Header />,
          tabBarActiveTintColor: "red",
          tabBarIcon: ({ color, size }) => (
            <Search width={size} height={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
