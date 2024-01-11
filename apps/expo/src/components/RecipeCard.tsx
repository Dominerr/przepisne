import React, { useState } from "react";

import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@acme/api";
import Clock from "../assets/icons/Clock";
import Fire from "../assets/icons/Fire";

export const RecipeCard: React.FC<{
  recipe: inferProcedureOutput<AppRouter["recipe"]["all"]>[number];
  ingredients: inferProcedureOutput<AppRouter["helper"]["allIngredients"]>;
  units: inferProcedureOutput<AppRouter["helper"]["allUnits"]>;
}> = ({ recipe, ingredients, units }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <>
      <View className="rounded-lg border border-gray-300 bg-white p-4">
        <View className="flex flex-row items-center">
          <Text className="flex-1 text-2xl font-bold leading-6">
            {recipe.name}
          </Text>

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
          <View className="my-2 rounded bg-gray-200 p-2">
            {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
              <View
                className="flex flex-row gap-x-2"
                key={`${ingredient.id} ${index}`}
              >
                <Text className="font-semibold">{`${index + 1}.`}</Text>
                <Text className="italic">
                  {[
                    ingredient.amount,
                    units.find((unit) => unit.id === ingredient.unitId)?.name ||
                      "",
                    "of",
                    ingredients.find(({ id }) => id === ingredient.ingredientId)
                      ?.name || "",
                  ].join(" ")}
                </Text>
              </View>
            ))}
            {recipe.ingredients.length > 4 && (
              <View className="flex flex-row gap-x-2">
                <Text className="font-semibold">{`and ${
                  recipe.ingredients.length - 4
                } more...`}</Text>
              </View>
            )}
          </View>
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-x-2">
              <Fire className="text-orange-500" />
              <Text className="text-base text-slate-500">
                Medium Difficulty
              </Text>
            </View>
            <TouchableOpacity
              className="w-max"
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View className="flex h-9 w-max items-center justify-center rounded-md border border-gray-300 px-3 text-sm  font-medium">
                <Text className="text-lg font-medium">View Recipe</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        animationType="none"
        transparent
        className="items-center justify-center"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <StatusBar backgroundColor={modalVisible ? "rgba(0, 0, 0, 0.5)" : ""} />
        <SafeAreaView
          className="h-full justify-center"
          style={{
            backgroundColor: modalVisible ? "rgba(0, 0, 0, 0.5)" : "",
          }}
        >
          <ScrollView className="m-4 flex-grow-0 rounded-lg border border-gray-300 bg-white px-4 pt-6 pb-0">
            <View className="flex flex-row items-center">
              <Text className="flex-1 text-2xl font-bold leading-6">
                {recipe.name}
              </Text>

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
              <View className="my-2 rounded bg-gray-200 p-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <View
                    className="flex flex-row gap-x-2"
                    key={`${ingredient.id} ${index}`}
                  >
                    <Text className="font-semibold">{`${index + 1}.`}</Text>
                    <Text className="italic">
                      {[
                        ingredient.amount,
                        units.find((unit) => unit.id === ingredient.unitId)
                          ?.name || "",
                        "of",
                        ingredients.find(
                          ({ id }) => id === ingredient.ingredientId,
                        )?.name || "",
                      ].join(" ")}
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="text-lg font-semibold">Instructions</Text>
              <View className="my-2 rounded bg-gray-200 p-2">
                {recipe.instructions.map((instruction, index) => (
                  <View className="flex flex-row gap-x-2" key={instruction.id}>
                    <Text className="font-semibold">{`${index + 1}.`}</Text>
                    <Text className="italic">{instruction.instruction}</Text>
                  </View>
                ))}
              </View>
              <View className="mb-8 flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-x-2">
                  <Fire className="text-orange-500" />
                  <Text className="text-base text-slate-500">
                    Medium Difficulty
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-max"
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}
                >
                  <View className="flex h-9 w-max items-center justify-center rounded-md border border-gray-300 px-3 text-sm  font-medium">
                    <Text className="text-lg font-medium">Close</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};
