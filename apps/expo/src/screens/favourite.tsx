import React from "react";

import { RefreshControl, Text, TouchableOpacity, View } from "react-native";

import { FlashList } from "@shopify/flash-list";

import { trpc } from "../utils/trpc";

import { StackScreenProps } from "@react-navigation/stack";
import { RootParamList } from "../components/TabNavigation";

import { RecipeCard } from "../components/RecipeCard";
import { useUser } from "@clerk/clerk-expo";

type FavouriteScreenProps = StackScreenProps<RootParamList, "Favourite">;

export const FavouriteScreen = ({ navigation }: FavouriteScreenProps) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { user } = useUser();
  const utils = trpc.useContext();
  const {
    data: favouriteRecipes,
    isSuccess: areFavouriteRecipesSuccess,
    fetchNextPage,
  } = trpc.recipe.favourite.useInfiniteQuery(
    {
      userId: user?.id!,
      limit: 10,
    },
    {
      enabled: !!user,
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );
  const { data: ingredients, isSuccess: areIngredientsSuccess } =
    trpc.helper.allIngredients.useQuery();
  const { data: units, isSuccess: areUnitsSuccess } =
    trpc.helper.allUnits.useQuery();

  const favouriteRecipesPages = favouriteRecipes?.pages.flatMap(
    (page) => page.recipes,
  );

  if (
    !areIngredientsSuccess ||
    !areUnitsSuccess ||
    !areFavouriteRecipesSuccess ||
    !favouriteRecipesPages
  ) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="h-full w-full px-6 py-2">
      <View className="mb-4 flex flex-row items-center justify-between gap-x-2">
        <Text className="pb-2 text-2xl font-semibold text-black">
          Favourite Recipes
        </Text>
      </View>

      {favouriteRecipesPages.length === 0 && (
        <View className="flex h-full flex-col items-center justify-center">
          <Text className="text-2xl font-semibold text-black">
            You have no favourite recipes!
          </Text>
          <Text className="text-md max-w-[250px] text-center font-medium text-black">
            Add some recipes to your favourites to see them here.
          </Text>
        </View>
      )}
      {favouriteRecipesPages.length > 0 && (
        <FlashList
          data={[...favouriteRecipesPages]}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item.recipe}
              ingredients={ingredients}
              units={units}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                utils.recipe.favourite.invalidate().then(() => {
                  setRefreshing(false);
                });
              }}
            />
          }
          onEndReached={() => {
            setRefreshing(true);
            fetchNextPage().then(() => {
              setRefreshing(false);
            });
          }}
        />
      )}
    </View>
  );
};
