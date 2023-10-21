import React from "react";

import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@acme/api";

import { trpc } from "../utils/trpc";

const SignOut = () => {
  const { signOut } = useAuth();
  return (
    <View className="rounded-lg border-2 border-gray-500 p-4">
      <Button
        title="Sign Out"
        onPress={() => {
          signOut();
        }}
      />
    </View>
  );
};

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

export const HomeScreen = () => {
  const recipeQuery = trpc.recipe.all.useQuery();
  const [showRecipe, setShowRecipe] = React.useState<string | null>(null);

  return (
    <SafeAreaView className="bg-[#2e026d] bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <View className="h-full w-full p-4">
        <Text className="mx-auto pb-2 text-5xl font-bold text-white">
          Create <Text className="text-[#cc66ff]">T3</Text> Turbo
        </Text>

        <View className="py-2">
          {showRecipe ? (
            <Text className="text-white">
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
        <SignOut />
      </View>
    </SafeAreaView>
  );
};
