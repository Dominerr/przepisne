import { Text, View } from "react-native";

import { trpc } from "../utils/trpc";
import { StackScreenProps } from "@react-navigation/stack";
import { RootParamList } from "../components/TabNavigation";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { RecipeCard } from "../components/RecipeCard";

type DiscoverScreenProps = StackScreenProps<RootParamList, "Discover">;

export const DiscoverScreen = ({ navigation }: DiscoverScreenProps) => {
  const recipeQuery = trpc.recipe.all.useQuery();

  return (
    <View className="h-full w-full bg-white px-4">
      <Text className="pb-2 text-2xl font-semibold text-black">
        Search for recipes:
      </Text>

      <FlashList
        data={recipeQuery.data}
        estimatedItemSize={20}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={(p) => <RecipeCard recipe={p.item} />}
      />
    </View>
  );
};
