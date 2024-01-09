import React from "react";

import { Text, TouchableOpacity, View } from "react-native";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@acme/api";
import Clock from "../assets/icons/Clock";
import { FlashList } from "@shopify/flash-list";
import Fire from "../assets/icons/Fire";

export const RecipeCard: React.FC<{
  recipe: inferProcedureOutput<AppRouter["recipe"]["all"]>[number];
  ingredients: inferProcedureOutput<AppRouter["helper"]["allIngredients"]>;
  units: inferProcedureOutput<AppRouter["helper"]["allUnits"]>;
}> = ({ recipe, ingredients, units }) => {
  return (
    <View className="rounded-lg border border-gray-300 bg-white p-4">
      <View className="flex flex-row items-center">
        <Text className="text-2xl font-bold leading-6">{recipe.name}</Text>

        <View className="ml-auto flex flex-row items-center">
          <Clock className="mr-2 text-slate-600" />
          <Text className="text-slate-600">30 minutes</Text>
        </View>
      </View>
      <View className="mb-6">
        <Text className="italic text-slate-600">
          By{" "}
          <Text className="font-medium">
            {recipe.author?.firstName} {recipe.author?.lastName}
          </Text>
        </Text>
      </View>
      <View className="gap-y-2">
        <Text className="text-lg font-semibold">Ingredients</Text>
        <View className="my-2 h-[150px] rounded bg-gray-200 p-2">
          <FlashList
            data={recipe.ingredients}
            estimatedItemSize={20}
            renderItem={({ item, index }) => (
              <View className="flex flex-row gap-x-2">
                <Text className="font-semibold">{`${index + 1}.`}</Text>
                <Text className="italic">
                  {[
                    item.amount,
                    units.find((unit) => unit.id === item.unitId)?.name || "",
                    "of",
                    ingredients.find(
                      (ingredient) => ingredient.id === item.ingredientId,
                    )?.name || "",
                  ].join(" ")}
                </Text>
              </View>
            )}
          />
        </View>
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-x-2">
            <Fire className="text-orange-500" />
            <Text className="text-base text-slate-500">Medium Difficulty</Text>
          </View>
          <TouchableOpacity className="w-max">
            <View className="flex h-9 w-max items-center justify-center rounded-md border border-gray-300 px-3 text-sm  font-medium">
              <Text className="text-lg font-medium">View Recipe</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
