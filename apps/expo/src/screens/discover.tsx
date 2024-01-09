import { Text, View } from "react-native";

import { trpc } from "../utils/trpc";
import { StackScreenProps } from "@react-navigation/stack";
import { RootParamList } from "../components/TabNavigation";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { RecipeCard } from "../components/RecipeCard";

type DiscoverScreenProps = StackScreenProps<RootParamList, "Discover">;

export const DiscoverScreen = ({}: DiscoverScreenProps) => {
  const { data: allRecipes } = trpc.recipe.all.useQuery();
  const { data: ingredients, isSuccess: areIngredientsSuccess } =
    trpc.helper.allIngredients.useQuery();
  const { data: units, isSuccess: areUnitsSuccess } =
    trpc.helper.allUnits.useQuery();

  if (!areIngredientsSuccess || !areUnitsSuccess) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="h-full w-full px-6 py-2">
      <View className="mb-4 flex items-center justify-between gap-x-2">
        <Text className="pb-2 text-2xl font-semibold text-black">
          Search for Recipes:
        </Text>
        <Text>Search component will go here</Text>
      </View>

      <FlashList
        data={allRecipes}
        estimatedItemSize={20}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} ingredients={ingredients} units={units} />
        )}
      />
    </View>
  );
};
