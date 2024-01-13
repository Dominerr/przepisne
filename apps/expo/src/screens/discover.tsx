import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { trpc } from "../utils/trpc";
import { StackScreenProps } from "@react-navigation/stack";
import { RootParamList } from "../components/TabNavigation";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { RecipeCard } from "../components/RecipeCard";
import { CustomTextInput } from "../components/CustomTextInput";
import Search from "../assets/icons/Search";
import Check from "../assets/icons/Check";

type DiscoverScreenProps = StackScreenProps<RootParamList, "Discover">;

export const DiscoverScreen = ({}: DiscoverScreenProps) => {
  const [searchModalVisible, setSearchModalVisible] = React.useState(false);
  const searchInputRef = React.useRef<TextInput>(null);
  const { control, watch, setValue } = useForm<{
    search: string;
    ingredients: string[];
  }>({
    defaultValues: {
      search: "",
      ingredients: [],
    },
  });

  const { data: allRecipes, isLoading: areRecipesLoading } =
    trpc.recipe.search.useQuery({
      search: watch("search"),
      ingredients: watch("ingredients"),
    });

  const { data: allIngredients, isSuccess: areIngredientsSuccess } =
    trpc.helper.allIngredients.useQuery();
  const { data: units, isSuccess: areUnitsSuccess } =
    trpc.helper.allUnits.useQuery();

  if (!areIngredientsSuccess || !areUnitsSuccess) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <View className="h-full w-full px-6 py-2">
        <Text className="text-justify text-2xl font-bold">
          Discover recipes
        </Text>
        <Text className="text-md mb-4 font-medium italic">
          Search for recipes based on ingredients you have!
        </Text>
        <View className="mb-4 flex items-center justify-between gap-x-2">
          <TouchableOpacity
            onPress={() => {
              setSearchModalVisible(true);
            }}
          >
            <View className="min-w-[240px] flex-row items-center justify-between rounded-lg border border-teal-600 p-2">
              <TextInput
                placeholder="Search recipes"
                className="text-black"
                editable={false}
                value={watch("search")}
                onPressIn={(e) => {
                  e.preventDefault();
                  setSearchModalVisible(true);
                  searchInputRef.current?.focus();
                }}
              />

              <Search className="text-black" />
            </View>
          </TouchableOpacity>
        </View>
        {areRecipesLoading && (
          <Text className="text-md text-center font-medium">Loading...</Text>
        )}
        {allRecipes?.length === 0 && (
          <Text className="text-md text-center font-medium">
            No recipes found.
          </Text>
        )}
        <FlashList
          data={allRecipes}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              ingredients={allIngredients}
              units={units}
            />
          )}
        />
      </View>

      <Modal
        animationType="slide"
        onShow={() => {
          searchInputRef.current?.focus();
        }}
        visible={searchModalVisible}
        onRequestClose={() => {
          setSearchModalVisible(false);
        }}
      >
        <View className="h-full">
          <View className="h-full flex-shrink">
            <View>
              <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
                <Text className="text-2xl font-bold">Search Recipes</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchModalVisible(false);
                  }}
                >
                  <Text className="text-lg font-medium text-teal-600">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="p-4">
                <Controller
                  control={control}
                  name="search"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomTextInput
                      ref={searchInputRef}
                      onChangeText={(value) => onChange(value)}
                      value={value}
                      placeholder="Search for recipes"
                    />
                  )}
                />
              </View>
            </View>
            <View className="h-full px-4">
              <Text className="mb-6 text-xl font-medium">
                Select ingredients
              </Text>
              <View className="h-[300px]">
                <FlashList
                  data={[...allIngredients]}
                  keyboardShouldPersistTaps="always"
                  estimatedItemSize={20}
                  ItemSeparatorComponent={() => <View className="h-2" />}
                  renderItem={({ item }) => {
                    const isSelected = watch("ingredients")?.includes(item.id);
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          if (!watch("ingredients")) {
                            setValue("ingredients", [item.id]);
                          }

                          if (isSelected) {
                            setValue(
                              "ingredients",
                              watch("ingredients").filter(
                                (ingredientId) => ingredientId !== item.id,
                              ),
                            );
                          } else {
                            setValue("ingredients", [
                              ...watch("ingredients"),
                              item.id,
                            ]);
                          }
                        }}
                        className={`flex-row items-center justify-between rounded-lg border p-3 ${
                          isSelected
                            ? "border-gray-400 bg-gray-100"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <Text>{item.name}</Text>
                        <Check
                          className={
                            isSelected ? "text-black" : "text-transparent"
                          }
                        />
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </View>
          </View>
          <View className="self-center ">
            <TouchableOpacity
              onPress={() => {
                setSearchModalVisible(false);
              }}
              className="mb-4 items-center rounded-xl border border-gray-300 px-8 py-2"
            >
              <Text className="text-md font-medium">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
