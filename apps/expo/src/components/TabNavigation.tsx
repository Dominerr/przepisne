import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomeScreen } from "../screens/home";
import { Header } from "./Header";
import { DiscoverScreen } from "../screens/discover";
import Home from "../assets/icons/Home";
import Search from "../assets/icons/Search";
import { CreateRecipeScreen } from "../screens/create_recipe";
import Add from "../assets/icons/Add";

export type RootParamList = {
  Test: undefined;
  Home: { paramA: string };
  Discover: undefined;
  CreateRecipe: undefined;
};

const Tab = createBottomTabNavigator<RootParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          unmountOnBlur: true,
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
          unmountOnBlur: true,
          header: () => <Header />,
          tabBarActiveTintColor: "red",
          tabBarIcon: ({ color, size }) => (
            <Search width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateRecipe"
        component={CreateRecipeScreen}
        options={{
          unmountOnBlur: true,
          header: () => <Header />,
          tabBarActiveTintColor: "red",
          tabBarIcon: ({ color, size }) => (
            <Add width={size} height={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
