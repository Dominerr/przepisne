import React from "react";

import { Text, View } from "react-native";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@acme/api";

export const RecipeCard: React.FC<{
  recipe: inferProcedureOutput<AppRouter["recipe"]["all"]>[number];
}> = ({ recipe }) => {
  return (
    <View className="rounded-lg border-2 border-gray-500 p-4">
      <Text className="text-xl font-semibold text-[#cc66ff]">
        {recipe.name}
      </Text>
      <Text className="text-black">{recipe.ingredients}</Text>
      <Text className="text-black">{recipe.instructions}</Text>
    </View>
  );
};
