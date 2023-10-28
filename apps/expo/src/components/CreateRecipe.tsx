import React from "react";

import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";

import { trpc } from "../utils/trpc";

export const CreateRecipe: React.FC = () => {
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
    <View className="flex bg-white px-4">
      <Text className="text-xl font-semibold text-[#cc66ff]">
        Dodaj przepis
      </Text>
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
        <Text className="font-semibold text-white">Zapisz</Text>
      </TouchableOpacity>
    </View>
  );
};
