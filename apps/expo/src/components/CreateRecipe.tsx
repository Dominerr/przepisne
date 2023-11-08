import React from "react";

import {
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";

import { trpc } from "../utils/trpc";
import { useForm, Controller } from "react-hook-form";
import SelectDropdown from "react-native-select-dropdown";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const styles = StyleSheet.create({
  dropdown2BtnStyle: {
    height: 50,
    margin: 8,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  dropdown2BtnTxtStyle: { color: "#444", textAlign: "left" },
  dropdown2DropdownStyle: { backgroundColor: "#EFEFEF" },
  dropdown2RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },
  dropdown2RowTxtStyle: { color: "#444", textAlign: "left" },
});

const recipeSchema = z.object({
  name: z.string(),
  instructions: z.string(),
  authorId: z.string(),
  ingredients: z.array(
    z.object({
      amount: z.number(),
      ingredientId: z.string(),
      unitId: z.string(),
    }),
  ),
});

type RecipeForm = z.infer<typeof recipeSchema>;

export const CreateRecipe: React.FC = () => {
  const { data: ingredientsAll, isSuccess: areIngredientsSuccess } =
    trpc.helper.allIngredients.useQuery();
  const { data: unitsAll, isSuccess: areUnitsSuccess } =
    trpc.helper.allUnits.useQuery();
  const { user } = useUser();
  const utils = trpc.useContext();
  const { mutate } = trpc.recipe.create.useMutation({
    async onSuccess() {
      await utils.recipe.all.invalidate();
    },
  });

  const { control, watch, setValue, getValues } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      instructions: "",
      ingredients: [],
      authorId: user?.id,
    },
  });

  console.log(watch());

  if (!areIngredientsSuccess || !areUnitsSuccess) {
    return null;
  }

  return (
    <View className="flex bg-white px-4">
      <Text className="text-xl font-semibold text-[#cc66ff]">
        Dodaj przepis
      </Text>

      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="mb-2 rounded border-2 border-gray-500 p-2 text-black"
            onChangeText={onChange}
            value={value}
            placeholder="Name"
          />
        )}
        name="name"
        rules={{ required: true }}
      />
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="mb-2 rounded border-2 border-gray-500 p-2 text-black"
            onChangeText={onChange}
            value={value}
            placeholder="Name"
          />
        )}
        name="instructions"
        rules={{ required: true }}
      />
      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="mb-2 rounded border-2 border-gray-500 p-2 text-black"
            onChangeText={onChange}
            value={value}
            placeholder="Name"
          />
        )}
        name="name"
        rules={{ required: true }}
      />

      <Button
        title="Add ingredient"
        onPress={() => {
          setValue("ingredients", [
            ...watch("ingredients"),
            { amount: -1, ingredientId: "", unitId: "" },
          ]);
        }}
      />

      {getValues("ingredients").map((_, index) => {
        return (
          <View className="flex items-center gap-1" key={index}>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  keyboardType="phone-pad"
                  className="mt-2 rounded border-2 border-gray-500  text-black"
                  onChangeText={(value) => {
                    onChange(value.replace(/[^0-9]/g, ""));
                  }}
                  value={value.toString().replace(/[^0-9]/g, "")}
                  placeholder="Amount"
                />
              )}
              name={`ingredients.${index}.amount`}
              rules={{ required: true }}
            />
            <Controller
              control={control}
              render={({ field: { onChange } }) => (
                <SelectDropdown
                  buttonStyle={styles.dropdown2BtnStyle}
                  buttonTextStyle={styles.dropdown2BtnTxtStyle}
                  dropdownIconPosition={"right"}
                  dropdownStyle={styles.dropdown2DropdownStyle}
                  rowStyle={styles.dropdown2RowStyle}
                  rowTextStyle={styles.dropdown2RowTxtStyle}
                  data={unitsAll}
                  buttonTextAfterSelection={(selectedItem) => {
                    return selectedItem.name;
                  }}
                  rowTextForSelection={(item) => {
                    return item.name;
                  }}
                  onSelect={(item) => {
                    onChange(item.id);
                  }}
                />
              )}
              name={`ingredients.${index}.unitId`}
              rules={{ required: true }}
            />
            <Controller
              control={control}
              render={({ field: { onChange } }) => (
                <SelectDropdown
                  data={ingredientsAll}
                  buttonTextAfterSelection={(selectedItem) => {
                    return selectedItem.name;
                  }}
                  rowTextForSelection={(item) => {
                    return item.name;
                  }}
                  onSelect={(item) => {
                    onChange(item.id);
                  }}
                />
              )}
              name={`ingredients.${index}.ingredientId`}
              rules={{ required: true }}
            />
          </View>
        );
      })}

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
