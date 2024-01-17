import React from "react";

import {
  RefreshControl,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

import { FlashList } from "@shopify/flash-list";

import { trpc } from "../utils/trpc";

import { StackScreenProps } from "@react-navigation/stack";
import { RootParamList } from "../components/TabNavigation";

import { RecipeCard } from "../components/RecipeCard";
import { useUser } from "@clerk/clerk-expo";
import { CustomButton } from "../components/CustomButton";

type HomeScreenProps = StackScreenProps<RootParamList, "Home">;

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { user } = useUser();
  const utils = trpc.useContext();
  const {
    data: myRecipes,
    isSuccess: areMyRecipesSuccess,
    fetchNextPage,
  } = trpc.recipe.byAuthorId.useInfiniteQuery(
    {
      authorId: user?.id!,
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

  const myRecipesPages = myRecipes?.pages.flatMap((page) => page.recipes);

  if (
    !areIngredientsSuccess ||
    !areUnitsSuccess ||
    !areMyRecipesSuccess ||
    !myRecipesPages
  ) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="h-full w-full px-6 py-2">
      <View className="mb-4 flex flex-row items-center justify-between gap-x-2">
        <Text className="pb-2 text-2xl font-semibold text-black">
          Your Recipes
        </Text>

        <CustomButton onPressOut={() => navigation.navigate("CreateRecipe")}>
          <Text className="text-lg font-medium text-white">Create Recipe</Text>
        </CustomButton>
      </View>

      {myRecipesPages.length === 0 && (
        <View className="flex h-full flex-col items-center justify-center">
          <Text className="text-2xl font-semibold text-black">
            No recipes yet!
          </Text>
          <Text className="text-md max-w-[250px] text-center font-medium text-black">
            Create some recipes to see them here.
          </Text>
        </View>
      )}
      {myRecipesPages.length > 0 && (
        <FlashList
          data={[...myRecipesPages]}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              ingredients={ingredients}
              units={units}
              isAuthor
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
