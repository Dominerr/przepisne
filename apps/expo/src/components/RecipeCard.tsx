import React, { useState } from "react";

import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ToastAndroid,
} from "react-native";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@acme/api";
import Fire from "../assets/icons/Fire";
import Star from "../assets/icons/Star";
import { trpc } from "../utils/trpc";
import { useUser } from "@clerk/clerk-expo";
import Clock from "../assets/icons/Clock";
import Delete from "../assets/icons/Delete";

export const RecipeCard: React.FC<{
  recipe: inferProcedureOutput<AppRouter["recipe"]["all"]>[number];
  ingredients: inferProcedureOutput<AppRouter["helper"]["allIngredients"]>;
  units: inferProcedureOutput<AppRouter["helper"]["allUnits"]>;
  isAuthor?: boolean;
}> = ({ recipe, ingredients, units, isAuthor }) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const utils = trpc.useContext();
  const { user } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const { mutate: changeFavouriteStatus } =
    trpc.recipe.changeFavouriteStatus.useMutation({
      onSuccess: async () => {
        await utils.recipe.invalidate();
      },
    });

  const { mutate: deleteRecipe } = trpc.recipe.delete.useMutation({
    onSuccess: () => {
      utils.recipe.invalidate();
      ToastAndroid.show("Recipe deleted", ToastAndroid.SHORT);
    },
  });

  const isSaved = recipe?.savedByUsers?.some(
    (savedByUser) => savedByUser.userId === user?.id,
  );

  return (
    <>
      <View className="rounded-lg border border-gray-300 bg-white p-4">
        <View className="flex flex-row items-center">
          <Text className="flex-1 text-2xl font-bold leading-6">
            {recipe.name}
          </Text>

          <View className="ml-auto flex flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                changeFavouriteStatus({
                  recipeId: recipe.id,
                  userId: user?.id!,
                });
              }}
            >
              <Star className={isSaved ? "text-amber-600" : "text-slate-300"} />
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-2">
          <Text className="italic text-slate-600">
            By{" "}
            <Text className="font-medium">
              {recipe.author?.firstName} {recipe.author?.lastName}
            </Text>
          </Text>
        </View>
        <View className="gap-y-4">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-x-2">
              <Fire
                className={
                  recipe.difficulty === "Easy"
                    ? "text-green-800"
                    : recipe.difficulty === "Medium"
                    ? "text-orange-500"
                    : "text-red-500"
                }
              />
              <Text className="text-base text-slate-500">
                {recipe.difficulty} Difficulty
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Clock className="text-slate-500" />
              <Text className="text-base text-slate-500">
                {recipe.timeRequired} min
              </Text>
            </View>
          </View>
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

          <View>
            <TouchableOpacity
              className="w-max"
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View className="flex h-9 w-max items-center justify-center rounded-md border border-black px-3 text-sm  font-medium">
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
        <SafeAreaView
          onTouchEnd={() => {
            setModalVisible(!modalVisible);
          }}
          className="h-full justify-center"
          style={{
            backgroundColor: modalVisible ? "rgba(0, 0, 0, 0.5)" : "",
          }}
        >
          <ScrollView
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
            className="m-4 flex-grow-0 rounded-lg border border-gray-300 bg-white px-4"
          >
            <View className="flex flex-row items-center pt-6">
              <Text className="flex-1 text-2xl font-bold leading-6">
                {recipe.name}
              </Text>

              <View className="ml-auto flex flex-row items-center">
                <TouchableOpacity
                  onPress={() => {
                    changeFavouriteStatus({
                      recipeId: recipe.id,
                      userId: user?.id!,
                    });
                  }}
                >
                  <Star
                    className={isSaved ? "text-amber-600" : "text-slate-300"}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View className="mb-3">
              <Text className="italic text-slate-600">
                By{" "}
                <Text className="font-medium">
                  {recipe.author?.firstName} {recipe.author?.lastName}
                </Text>
              </Text>
            </View>
            <View className="mb-4 gap-y-6">
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-x-2">
                  <Fire
                    className={
                      recipe.difficulty === "Easy"
                        ? "text-green-800"
                        : recipe.difficulty === "Medium"
                        ? "text-orange-500"
                        : "text-red-500"
                    }
                  />
                  <Text className="text-base text-slate-500">
                    {recipe.difficulty} Difficulty
                  </Text>
                </View>

                <View className="flex flex-row items-center gap-x-2">
                  <Clock className="text-slate-500" />
                  <Text className="text-base text-slate-500">
                    {recipe.timeRequired} min
                  </Text>
                </View>
              </View>
              <View>
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
              </View>
              <View>
                <Text className="text-lg font-semibold">Instructions</Text>
                <View className="my-2 rounded bg-gray-200 p-2">
                  {!!recipe.instructions.length &&
                    recipe.instructions.map((instruction, index) => (
                      <View
                        className="flex flex-row gap-x-2"
                        key={instruction.id}
                      >
                        <Text className="font-semibold">{`${index + 1}.`}</Text>
                        <Text className="italic">
                          {instruction.instruction}
                        </Text>
                      </View>
                    ))}
                  {!recipe.instructions.length && (
                    <Text className="italic">No instructions.</Text>
                  )}
                </View>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="w-max flex-1"
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}
                >
                  <View className="flex h-9 w-max items-center justify-center rounded-md border border-black px-3 text-sm font-medium">
                    <Text className="text-lg font-medium">Close</Text>
                  </View>
                </TouchableOpacity>
                {isAuthor && (
                  <TouchableOpacity
                    className="ml-4 p-2"
                    onPress={() => {
                      setDeleteModalVisible(!deleteModalVisible);
                    }}
                  >
                    <Delete className="h-10 w-10 text-red-500" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal
        animationType="none"
        transparent
        className="items-center justify-center"
        visible={deleteModalVisible}
        onRequestClose={() => {
          setDeleteModalVisible(!deleteModalVisible);
        }}
      >
        <StatusBar
          backgroundColor={deleteModalVisible ? "rgba(0, 0, 0, 0.5)" : ""}
        />
        <SafeAreaView
          className="h-full justify-center"
          style={{
            backgroundColor: deleteModalVisible ? "rgba(0, 0, 0, 0.5)" : "",
          }}
        >
          <View className="m-4 flex-grow-0 rounded-lg border border-gray-300 bg-white px-4 pt-6 pb-0">
            <View className="flex flex-row items-center">
              <Text className="flex-1 text-2xl font-bold leading-6">
                Delete Recipe
              </Text>
            </View>
            <View className="mb-3">
              <Text className="italic text-slate-600">
                Are you sure you want to delete this recipe?
              </Text>
            </View>
            <View className="mb-4 gap-y-6">
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="w-max flex-1"
                  onPress={() => {
                    setDeleteModalVisible(!deleteModalVisible);
                  }}
                >
                  <View className="flex h-9 w-max items-center justify-center rounded-md border border-black px-3 text-sm font-medium">
                    <Text className="text-lg font-medium">Cancel</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="ml-4 p-2"
                  onPress={() => {
                    deleteRecipe({
                      id: recipe.id,
                      userId: user?.id!,
                    });
                    setDeleteModalVisible(false);
                    setModalVisible(false);
                  }}
                >
                  <Delete className="h-10 w-10 text-red-500" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};
