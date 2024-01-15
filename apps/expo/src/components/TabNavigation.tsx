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
          tabBarShowLabel: false,
          header: () => <Header />,
          tabBarActiveTintColor: "rgb(20 184 166)",
          tabBarIcon: ({ color, size }) => (
            <Home width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarShowLabel: false,
          header: () => <Header />,
          tabBarActiveTintColor: "rgb(20 184 166)",
          tabBarIcon: ({ color, size }) => (
            <Search width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateRecipe"
        component={CreateRecipeScreen}
        options={{
          tabBarShowLabel: false,
          header: () => <Header />,
          tabBarActiveTintColor: "rgb(20 184 166)",
          tabBarIcon: ({ color, size }) => (
            <Add width={size} height={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
