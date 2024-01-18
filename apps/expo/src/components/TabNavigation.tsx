import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomeScreen } from "../screens/home";
import { Header } from "./Header";
import { DiscoverScreen } from "../screens/discover";
import Home from "../assets/icons/Home";
import Search from "../assets/icons/Search";
import { CreateRecipeScreen } from "../screens/create_recipe";
import Add from "../assets/icons/Add";
import { FavouriteScreen } from "../screens/favourite";
import Star from "../assets/icons/Star";

export type RootParamList = {
  Test: undefined;
  Home: undefined;
  Favourite: undefined;
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
          tabBarActiveTintColor: "#14B8A6",
          tabBarIcon: ({ color, size }) => (
            <Home width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favourite"
        component={FavouriteScreen}
        options={{
          tabBarShowLabel: false,
          header: () => <Header />,
          tabBarActiveTintColor: "#14B8A6",
          tabBarIcon: ({ color, size }) => (
            <Star width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarShowLabel: false,
          header: () => <Header />,
          tabBarActiveTintColor: "#14B8A6",
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
          tabBarActiveTintColor: "#14B8A6",
          tabBarIcon: ({ color, size }) => (
            <Add width={size} height={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
