import React from "react";

import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@acme/api";

import { trpc } from "../utils/trpc";

const RecipeCard: React.FC<{
  recipe: inferProcedureOutput<AppRouter["recipe"]["all"]>[number];
}> = ({ recipe: recipe }) => {
  return (
    <View className="rounded-lg border-2 border-gray-500 p-4">
      <Text className="text-xl font-semibold text-[#cc66ff]">
        {recipe.name}
      </Text>
      <Text className="text-white">{recipe.ingredients}</Text>
      <Text className="text-white">{recipe.instructions}</Text>
    </View>
  );
};

const CreateRecipe: React.FC = () => {
  const { user } = useUser();
  const utils = trpc.useContext();
  const { mutate } = trpc.recipe.create.useMutation({
    async onSuccess() {
      await utils.recipe.all.invalidate();
    },
  });

  const [name, onChangeName] = React.useState("");
  const [instructions, onChangeInstructions] = React.useState("");
  const [ingredients, onChangeIngredients] = React.useState("");

  return (
    <View className="flex flex-col border-t-2 border-gray-500 p-4">
      <TextInput
        className="mb-2 rounded border-2 border-gray-500 p-2 text-white"
        onChangeText={onChangeName}
        placeholder="Name"
      />
      <TextInput
        className="mb-2 rounded border-2 border-gray-500 p-2 text-white"
        onChangeText={onChangeInstructions}
        placeholder="Instructions"
      />
      <TextInput
        className="mb-2 rounded border-2 border-gray-500 p-2 text-white"
        onChangeText={onChangeIngredients}
        placeholder="Ingredients"
      />

      <TouchableOpacity
        className="rounded bg-[#cc66ff] p-2"
        onPress={() => {
          if (!user?.id) return;
          mutate({
            name,
            instructions,
            ingredients,
            authorId: user.id,
          });
        }}
      >
        <Text className="font-semibold text-white">Publish post</Text>
      </TouchableOpacity>
    </View>
  );
};

import { StackScreenProps } from "@react-navigation/stack";
import { RootParamList } from "../components/TabNavigation";

type Screen1Props = StackScreenProps<RootParamList, "Home">;

export const HomeScreen = ({ navigation }: Screen1Props) => {
  const recipeQuery = trpc.recipe.all.useQuery();
  const [showRecipe, setShowRecipe] = React.useState<string | null>(null);

  return (
    <SafeAreaView className="bg-white">
      <View className="h-full w-full px-4">
        <Text className="pb-2 text-5xl font-bold text-black">Przepisne</Text>
        <Text className="pb-2 text-2xl font-semibold text-black">
          Twoje Przepisy:
        </Text>
        {/* <Button
          title="Go to test"
          onPress={() => {
            navigation.navigate("Test");
          }}
        /> */}

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

        <CreateRecipe />
      </View>
    </SafeAreaView>
  );
};
