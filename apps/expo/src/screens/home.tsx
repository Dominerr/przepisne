import React from "react";

import { Text, TouchableOpacity, View } from "react-native";

import { FlashList } from "@shopify/flash-list";

import { trpc } from "../utils/trpc";

import { StackScreenProps } from "@react-navigation/stack";
import { RootParamList } from "../components/TabNavigation";

import Add from "../assets/icons/Add";
import { RecipeCard } from "../components/RecipeCard";

type Screen1Props = StackScreenProps<RootParamList, "Home">;

export const HomeScreen = ({ navigation }: Screen1Props) => {
  const recipeQuery = trpc.recipe.all.useQuery();
  const [showRecipe, setShowRecipe] = React.useState<string | null>(null);

  return (
    <View className="h-full w-full bg-white p-4">
      <View className="flex flex-row items-center justify-between gap-2">
        <Text className="pb-2 text-2xl font-semibold text-black">
          Zapisane Przepisy:
        </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPressOut={() => navigation.navigate("CreateRecipe")}
        >
          <View className="rounded-full bg-blue-500 p-2 focus:bg-red-500 ">
            <Add className="text-blue-200" />
          </View>
        </TouchableOpacity>
      </View>

      <View className="py-2">
        {showRecipe ? (
          <Text className="text-black">
            <Text className="font-semibold">Selected post:</Text>
            {showRecipe}
          </Text>
        ) : (
          <Text className="font-semibold italic text-white">
            Press on a post
          </Text>
        )}
      </View>

      <FlashList
        data={recipeQuery.data}
        estimatedItemSize={20}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={(p) => (
          <TouchableOpacity onPress={() => setShowRecipe(p.item.id)}>
            <RecipeCard recipe={p.item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
