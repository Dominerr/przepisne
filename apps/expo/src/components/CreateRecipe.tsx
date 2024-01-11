import { useEffect, useRef, useState } from "react";

import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";

import { trpc } from "../utils/trpc";
import { useForm, Controller, get } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import Delete from "../assets/icons/Delete";
import { RecipeForm, recipeSchema } from "../api/recipe";
import { CustomTextInput } from "./CustomTextInput";

export const CreateRecipe = () => {
  const instructionsInputRefs = useRef<TextInput[]>([]);

  const utils = trpc.useContext();
  const [ingredientsModalVisible, setIngredientsModalVisible] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [ingredientInputVisible, setIngredientInputVisible] = useState<
    "ingredient" | "unit" | "amount"
  >("amount");

  const [instructionsModalVisible, setInstructionsModalVisible] =
    useState(false);

  const { data: ingredientsAll, isSuccess: areIngredientsSuccess } =
    trpc.helper.allIngredients.useQuery();
  const { data: unitsAll, isSuccess: areUnitsSuccess } =
    trpc.helper.allUnits.useQuery();
  const { user } = useUser();

  const {
    control,
    watch,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      instructions: [],
      ingredients: [],
      authorId: user?.id,
    },
  });

  const prevLengthRef = useRef(watch("instructions").length);

  const { mutate: addRecipe } = trpc.recipe.create.useMutation({
    async onSuccess() {
      reset();
      await utils.recipe.all.invalidate();
    },
  });

  const {
    control: ingredientControl,
    setValue: ingredientSetValue,
    watch: ingredientWatch,
    reset: ingredientReset,
  } = useForm<{
    amount?: number;
    ingredientId: string;
    unitId: string;
  }>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      amount: undefined,
      ingredientId: "",
      unitId: "",
    },
  });

  useEffect(() => {
    const currentLength = watch("instructions").length;
    if (currentLength > prevLengthRef.current) {
      instructionsInputRefs.current[currentLength - 1]?.focus();
    }
    prevLengthRef.current = currentLength;
  }, [watch("instructions").length]);

  const disabled =
    !ingredientWatch("amount") ||
    !ingredientWatch("unitId") ||
    !ingredientWatch("ingredientId");

  const onSubmit = handleSubmit((data) => {
    addRecipe({
      ...data,
      instructions: data.instructions.map((instruction, index) => {
        return {
          ...instruction,
          step: index + 1,
        };
      }),
    });
  });

  let indexToEdit = 0;
  const numberOfIngredients = watch("ingredients").length;
  const nonEmptyInstructions = watch("instructions").filter(
    ({ instruction }) => instruction !== "",
  );
  const isLastInstructionEmpty =
    watch("instructions")[watch("instructions").length - 1]?.instruction === "";

  if (!areIngredientsSuccess || !areUnitsSuccess) {
    return null;
  }

  return (
    <>
      <ScrollView className="flex overflow-scroll bg-gray-100 p-2">
        <View className="bg-card w-full max-w-md rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
          <View className="flex flex-col space-y-1.5 pb-4">
            <Text className="text-2xl font-semibold leading-none tracking-tight">
              Add recipe
            </Text>
          </View>
          <View>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Recipe name"
                  placeholder="Enter recipe name"
                  error={!!errors.name}
                  errorMessage="Recipe name is required"
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="name"
              rules={{ required: true }}
            />
            <View>
              <Text className="text-sm font-medium">Instructions</Text>
              <View className="my-2 w-full rounded p-2">
                {(nonEmptyInstructions || []).map((item, index) => (
                  <View
                    key={item.instruction + index}
                    className="flex flex-row"
                  >
                    <Text className="text-md font-semibold text-black">
                      {`${index + 1}. `}
                    </Text>
                    <Text className="text-md flex-1 text-justify italic text-black">
                      {item.instruction}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {watch("instructions")?.length === 0 ? (
              <TouchableOpacity
                className="mb-4 flex flex-row items-center justify-center rounded bg-teal-500 p-2"
                onPress={() => {
                  setInstructionsModalVisible(true);
                  setValue(`instructions.${watch("instructions").length}`, {
                    instruction: "",
                  });
                }}
              >
                <Text className="text-md font-medium leading-none text-white">
                  Add instructions
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="mb-4 flex flex-row items-center justify-center rounded bg-teal-500 p-2"
                onPress={() => {
                  setInstructionsModalVisible(true);
                }}
              >
                <Text className="text-md font-medium leading-none text-white">
                  Edit instructions
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium">Ingredients</Text>
            <View className="my-2 w-full rounded p-2">
              {(getValues("ingredients") || []).map((item, index) => (
                <View
                  key={`${item.ingredientId} ${item.unitId} ${index}`}
                  className="flex w-full flex-row items-center justify-center"
                >
                  <TouchableOpacity
                    onPress={() => {
                      ingredientSetValue("amount", item.amount);
                      ingredientSetValue("unitId", item.unitId);
                      ingredientSetValue("ingredientId", item.ingredientId);
                      setMode("edit");
                      setIngredientInputVisible("amount");
                      setIngredientsModalVisible(true);
                      indexToEdit = index;
                    }}
                  >
                    <Text className="text-md mx-1 my-2 min-w-[60px] rounded-lg border border-teal-200 p-2 text-center font-medium">
                      {item.amount}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      ingredientSetValue("amount", item.amount);
                      ingredientSetValue("unitId", item.unitId);
                      ingredientSetValue("ingredientId", item.ingredientId);
                      setMode("edit");
                      setIngredientInputVisible("unit");
                      setIngredientsModalVisible(true);
                      indexToEdit = index;
                    }}
                  >
                    <Text className="text-md mx-1 my-2 min-w-[60px] rounded-lg border border-teal-200 p-2 text-center font-medium">
                      {unitsAll.find(({ id }) => id === item.unitId)?.name}
                    </Text>
                  </TouchableOpacity>
                  <Text className="mx-1 my-2">of</Text>
                  <TouchableOpacity
                    onPress={() => {
                      ingredientSetValue("amount", item.amount);
                      ingredientSetValue("unitId", item.unitId);
                      ingredientSetValue("ingredientId", item.ingredientId);
                      setMode("edit");
                      setIngredientInputVisible("ingredient");
                      setIngredientsModalVisible(true);
                      indexToEdit = index;
                    }}
                  >
                    <Text className="text-md mx-1 my-2 min-w-[60px] rounded-lg border border-teal-200 p-2 text-center font-medium">
                      {
                        ingredientsAll.find(
                          ({ id }) => id === item.ingredientId,
                        )?.name
                      }
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View>
            <TouchableOpacity
              className="flex flex-row items-center justify-center rounded bg-teal-500 p-2"
              onPress={() => setIngredientsModalVisible(true)}
            >
              <Text className="text-md font-medium leading-none text-white">
                Add ingredients
              </Text>
            </TouchableOpacity>
            {errors.ingredients && (
              <Text className="text-sm font-medium leading-none text-red-500">
                Please add at least one ingredient
              </Text>
            )}
          </View>

          <TouchableOpacity
            className="mb-0 mt-6 flex flex-row items-center justify-center rounded bg-teal-700 p-2"
            onPress={onSubmit}
          >
            <Text className="text-md font-medium leading-none text-white">
              Save recipe
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        visible={instructionsModalVisible}
        onRequestClose={() => {
          setInstructionsModalVisible((prev) => !prev);
        }}
      >
        <View className="flex h-full bg-gray-100 p-4">
          <View className="bg-card flex h-full w-full max-w-md justify-between rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
            <View className="flex-shrink">
              <View className="flex flex-col space-y-1.5 pb-4">
                <Text className="text-2xl font-semibold leading-none tracking-tight">
                  Edit instructions
                </Text>
              </View>
              <View className="h-[375px] w-full space-y-8">
                <FlashList
                  data={[...watch("instructions")]}
                  numColumns={1}
                  estimatedItemSize={8}
                  renderItem={({ index }) => {
                    return (
                      <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <View className="w-full flex-row items-end justify-between gap-x-2">
                            <View className="flex-1">
                              <CustomTextInput
                                ref={(ref) => {
                                  instructionsInputRefs.current[index] =
                                    ref as TextInput;
                                }}
                                placeholder="Enter instruction"
                                label={`Step ${index + 1}`}
                                onChangeText={onChange}
                                value={value}
                              />
                            </View>
                            <TouchableOpacity
                              className="mb-[10px] w-min"
                              onPress={() => {
                                setValue(
                                  "instructions",
                                  watch("instructions").filter(
                                    (_, i) => i !== index,
                                  ),
                                );
                              }}
                            >
                              <Delete className="h-10 w-10  text-red-300" />
                            </TouchableOpacity>
                          </View>
                        )}
                        name={`instructions.${index}.instruction`}
                        rules={{ required: true }}
                      />
                    );
                  }}
                />
              </View>
            </View>
            <View className="flex items-end">
              <TouchableOpacity
                disabled={isLastInstructionEmpty}
                className={`w-max rounded bg-black p-2 ${
                  isLastInstructionEmpty ? "opacity-30" : "opacity-100"
                }`}
                onPress={() => {
                  setValue(`instructions.${watch("instructions").length}`, {
                    instruction: "",
                  });
                }}
              >
                <Text className="font-semibold text-white">Add step</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        visible={ingredientsModalVisible}
        onRequestClose={() => {
          setIngredientsModalVisible((prev) => !prev);
        }}
      >
        <View className="flex h-full bg-gray-100 p-4">
          <View className="bg-card flex h-full w-full max-w-md justify-between rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
            <View className="flex-shrink">
              {ingredientInputVisible === "amount" && (
                <>
                  <View className="flex flex-col space-y-1.5 pb-4">
                    <Text className="text-2xl font-semibold leading-none tracking-tight">
                      Edit ingredients
                    </Text>
                  </View>
                  <View className="h-[375px] w-full space-y-8">
                    <Controller
                      control={ingredientControl}
                      render={({ field: { onChange, value } }) => (
                        <CustomTextInput
                          keyboardType="phone-pad"
                          onSubmitEditing={() => {
                            setIngredientInputVisible("unit");
                          }}
                          onChangeText={(value) => {
                            onChange(value.replace(/[^0-9]/g, ""));
                          }}
                          value={value?.toString().replace(/[^0-9]/g, "")}
                          placeholder="Enter the amount"
                          label="Amount"
                        />
                      )}
                      name="amount"
                      rules={{ required: true }}
                    />
                  </View>
                </>
              )}

              {ingredientInputVisible === "unit" && (
                <>
                  <View className="flex flex-col space-y-1.5 pb-4">
                    <Text className="text-2xl font-semibold leading-none tracking-tight">
                      Edit ingredients
                    </Text>
                  </View>
                  <View className="w-full space-y-8">
                    <Controller
                      control={ingredientControl}
                      render={({ field: { onChange, value } }) => (
                        <CustomTextInput
                          keyboardType="phone-pad"
                          onSubmitEditing={() => {
                            setIngredientInputVisible("unit");
                          }}
                          onChangeText={(value) => {
                            onChange(value.replace(/[^0-9]/g, ""));
                          }}
                          value={value?.toString().replace(/[^0-9]/g, "")}
                          placeholder="Search for unit"
                          label="Select unit"
                        />
                      )}
                      name="amount"
                      rules={{ required: true }}
                    />
                  </View>

                  <View className="mt-4 flex h-[400px] w-full">
                    <FlashList
                      data={[...unitsAll]}
                      numColumns={2}
                      estimatedItemSize={8}
                      renderItem={({ item }) => {
                        return (
                          <View key={item.id} className="my-1">
                            <TouchableOpacity
                              activeOpacity={0.6}
                              onPress={() => {
                                ingredientSetValue("unitId", item.id);
                              }}
                              className="flex flex-row items-center p-3"
                            >
                              <View
                                className={`mr-2 h-1 w-1 rounded-full ${
                                  ingredientWatch("unitId") === item.id
                                    ? "bg-teal-500"
                                    : "bg-black"
                                }`}
                              />
                              <Text
                                className={`text-md text-center text-black ${
                                  ingredientWatch("unitId") === item.id
                                    ? "font-bold text-teal-500"
                                    : "text-black"
                                }`}
                              >
                                {item.name}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }}
                    />
                  </View>
                </>
              )}

              {ingredientInputVisible === "ingredient" && (
                <>
                  <View className="flex flex-col space-y-1.5 pb-4">
                    <Text className="text-2xl font-semibold leading-none tracking-tight">
                      Edit ingredients
                    </Text>
                  </View>
                  <View className="w-full space-y-8">
                    <Controller
                      control={ingredientControl}
                      render={({ field: { onChange, value } }) => (
                        <CustomTextInput
                          keyboardType="phone-pad"
                          onSubmitEditing={() => {
                            setIngredientInputVisible("unit");
                          }}
                          onChangeText={(value) => {
                            onChange(value.replace(/[^0-9]/g, ""));
                          }}
                          value={value?.toString().replace(/[^0-9]/g, "")}
                          placeholder="Search for ingredient"
                          label="Select ingredient"
                        />
                      )}
                      name="amount"
                      rules={{ required: true }}
                    />
                  </View>

                  <View className="mt-4 flex h-[400px] w-full">
                    <FlashList
                      data={[...ingredientsAll]}
                      numColumns={2}
                      estimatedItemSize={32}
                      renderItem={({ item }) => (
                        <View key={item.id} className="my-1">
                          <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => {
                              ingredientSetValue("ingredientId", item.id);
                            }}
                            className="flex flex-row items-center p-3"
                          >
                            <View
                              className={`mr-2 h-1 w-1 rounded-full ${
                                ingredientWatch("ingredientId") === item.id
                                  ? "bg-teal-500"
                                  : "bg-black"
                              }`}
                            />
                            <Text
                              className={`text-md text-center text-black ${
                                ingredientWatch("ingredientId") === item.id
                                  ? "font-bold text-teal-500"
                                  : "text-black"
                              }`}
                            >
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  </View>
                </>
              )}
            </View>

            <View className="relative flex w-full items-center">
              <View className="flex w-full items-center">
                <View className="mb-2 flex flex-row items-center gap-x-2">
                  <TouchableOpacity
                    onPress={() => {
                      setIngredientInputVisible("amount");
                    }}
                  >
                    <Text className="text-md min-w-[60px] rounded-lg border border-teal-200 p-2 text-center font-medium">
                      {ingredientWatch("amount") || "..."}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIngredientInputVisible("unit");
                    }}
                  >
                    <Text className="text-md min-w-[60px] rounded-lg border border-teal-200 p-2 text-center font-medium">
                      {unitsAll.find(
                        ({ id }) => id === ingredientWatch("unitId"),
                      )?.name || "..."}
                    </Text>
                  </TouchableOpacity>
                  <Text>of</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIngredientInputVisible("ingredient");
                    }}
                  >
                    <Text className="text-md min-w-[60px] rounded-lg border border-teal-200 p-2 text-center font-medium">
                      {ingredientsAll.find(
                        ({ id }) => id === ingredientWatch("ingredientId"),
                      )?.name || "..."}
                    </Text>
                  </TouchableOpacity>
                </View>

                {mode === "create" && (
                  <View className="flex flex-row gap-x-2">
                    <TouchableOpacity
                      disabled={disabled}
                      onPress={() => {
                        setValue(`ingredients.${numberOfIngredients}`, {
                          amount: Number(ingredientWatch("amount") || 0),
                          ingredientId: ingredientWatch("ingredientId"),
                          unitId: ingredientWatch("unitId"),
                        });
                        setIngredientsModalVisible(false);
                        ingredientReset();
                        setIngredientInputVisible("amount");
                      }}
                      className={`flex-1 items-center rounded-xl border border-gray-300 py-2 ${
                        disabled ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      <Text className="text-md font-medium">Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={disabled}
                      onPress={() => {
                        setValue(`ingredients.${numberOfIngredients}`, {
                          amount: Number(ingredientWatch("amount") || 0),
                          ingredientId: ingredientWatch("ingredientId"),
                          unitId: ingredientWatch("unitId"),
                        });
                        ingredientReset();
                        setIngredientInputVisible("amount");
                      }}
                      className={`flex-1 items-center rounded-xl border border-gray-300 py-2 ${
                        disabled ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      <Text className="text-md font-medium">Add another</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {mode === "edit" && (
                  <View className="flex flex-row gap-x-2">
                    <TouchableOpacity
                      disabled={disabled}
                      onPress={() => {
                        setValue(`ingredients.${indexToEdit}`, {
                          amount: Number(ingredientWatch("amount") || 0),
                          ingredientId: ingredientWatch("ingredientId"),
                          unitId: ingredientWatch("unitId"),
                        });
                        setIngredientsModalVisible(false);
                        setMode("create");
                        ingredientReset();
                        setIngredientInputVisible("amount");
                      }}
                      className={`flex-1 items-center rounded-xl border border-gray-300 py-2 ${
                        disabled ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      <Text className="text-md font-medium">Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={disabled}
                      onPress={() => {
                        setIngredientsModalVisible(false);
                        setMode("create");
                        ingredientReset();
                        setIngredientInputVisible("amount");
                      }}
                      className={`flex-1 items-center rounded-xl border border-gray-300 py-2 ${
                        disabled ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      <Text className="text-md font-medium">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
