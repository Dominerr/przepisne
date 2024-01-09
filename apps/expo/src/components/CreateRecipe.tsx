import { useState } from "react";

import { Text, TextInput, TouchableOpacity, View, Modal } from "react-native";
import { useUser } from "@clerk/clerk-expo";

import { trpc } from "../utils/trpc";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ArrowLeft from "../assets/icons/ArrowLeft";
import Search from "../assets/icons/Search";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import Delete from "../assets/icons/Delete";
import { RecipeForm, recipeSchema } from "../api/recipe";

export const CreateRecipe = () => {
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

  const disabled =
    !ingredientWatch("amount") ||
    !ingredientWatch("unitId") ||
    !ingredientWatch("ingredientId");

  console.log(errors);

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
      <View className="flex bg-gray-100 p-2">
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
                <View className="space-y-2">
                  <Text className="text-sm font-medium leading-none">
                    Recipe name
                  </Text>
                  <View className="mb-2">
                    <TextInput
                      className="rounded border border-gray-300 p-2 text-black focus:border-gray-500"
                      onChangeText={onChange}
                      value={value}
                      placeholder="Enter recipe name"
                    />
                    {errors.name && (
                      <Text className="text-sm font-medium leading-none text-red-500">
                        Recipe name is required
                      </Text>
                    )}
                  </View>
                </View>
              )}
              name="name"
              rules={{ required: true }}
            />

            {nonEmptyInstructions.length > 0 && (
              <View className="my-2 h-[150px] rounded bg-gray-200 p-2">
                <FlashList
                  data={nonEmptyInstructions}
                  numColumns={1}
                  estimatedItemSize={8}
                  renderItem={({ item, index }) => {
                    return (
                      <View className="flex flex-row gap-x-2">
                        <Text className="text-md font-semibold text-black">
                          {`${index + 1}. `}
                        </Text>
                        <Text className="text-md text-justify italic text-black">
                          {item.instruction}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            )}

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
          {getValues("ingredients").map((i, index) => {
            return (
              <View className="my-2 flex flex-row items-center gap-x-2">
                <TouchableOpacity
                  onPress={() => {
                    ingredientSetValue("amount", i.amount);
                    ingredientSetValue("unitId", i.unitId);
                    ingredientSetValue("ingredientId", i.ingredientId);
                    setMode("edit");
                    setIngredientInputVisible("amount");
                    setIngredientsModalVisible(true);
                    indexToEdit = index;
                  }}
                  className={`min-w-[40px] flex-1 justify-center bg-green-500 p-2`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 12,
                  }}
                >
                  <Text className="text-md text-center font-medium text-white">
                    {i.amount?.toString().toLocaleUpperCase()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    ingredientSetValue("amount", i.amount);
                    ingredientSetValue("unitId", i.unitId);
                    ingredientSetValue("ingredientId", i.ingredientId);
                    setMode("edit");
                    setIngredientInputVisible("unit");
                    setIngredientsModalVisible(true);
                    indexToEdit = index;
                  }}
                  className={`min-w-[40px] flex-1 justify-center bg-violet-500 p-2`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 12,
                  }}
                >
                  <Text className="text-md text-center font-medium text-white">
                    {unitsAll
                      .find(({ id }) => id === i.unitId)
                      ?.name.toLocaleUpperCase()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    ingredientSetValue("amount", i.amount);
                    ingredientSetValue("unitId", i.unitId);
                    ingredientSetValue("ingredientId", i.ingredientId);
                    setMode("edit");
                    setIngredientInputVisible("ingredient");
                    setIngredientsModalVisible(true);
                    indexToEdit = index;
                  }}
                  className={`min-w-[40px] flex-1 justify-center bg-teal-500 p-2`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 12,
                  }}
                >
                  <Text className="text-md text-center font-medium text-white">
                    {ingredientsAll
                      .find(({ id }) => id === i.ingredientId)
                      ?.name.toLocaleUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
          <TouchableOpacity
            className="mb-0 mt-6 flex flex-row items-center justify-center rounded bg-teal-700 p-2"
            onPress={onSubmit}
          >
            <Text className="text-md font-medium leading-none text-white">
              Save recipe
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="slide"
        visible={instructionsModalVisible}
        onRequestClose={() => {
          setInstructionsModalVisible((prev) => !prev);
        }}
      >
        <View className="flex bg-gray-100 p-2 pt-5">
          <View className="bg-card w-full max-w-md gap-y-4 rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
            <View className="flex flex-col space-y-1.5 pb-4">
              <Text className="text-2xl font-semibold leading-none tracking-tight">
                Edit instructions
              </Text>
            </View>
            <View className="h-[600px] w-full space-y-8">
              <FlashList
                data={[...watch("instructions")]}
                numColumns={1}
                estimatedItemSize={8}
                renderItem={({ index }) => {
                  return (
                    <Controller
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <View className="mb-2 space-y-2">
                          <Text className="text-sm font-medium leading-none">
                            Step {index + 1}
                          </Text>
                          <View className="flex flex-row items-center justify-between gap-x-2 ">
                            <TextInput
                              className="flex-1 rounded border border-gray-300 p-2 text-black focus:border-gray-500"
                              onChangeText={onChange}
                              value={value}
                              placeholder="Enter instruction"
                            />
                            <TouchableOpacity
                              className="w-min "
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
                        </View>
                      )}
                      name={`instructions.${index}.instruction`}
                      rules={{ required: true }}
                    />
                  );
                }}
              />
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
        <View className="flex h-full w-full justify-between">
          <View className="flex h-full w-full flex-shrink">
            {ingredientInputVisible === "ingredient" && (
              <>
                <View className="flex w-full items-center gap-y-2 overflow-auto border-b border-black">
                  <View className="relative flex w-full flex-row items-center justify-center ">
                    <TouchableOpacity
                      className="absolute left-0 p-2"
                      onPress={() => {
                        setIngredientsModalVisible((prev) => !prev);
                      }}
                    >
                      <ArrowLeft className="text-black" />
                    </TouchableOpacity>

                    <Text className="text-lg font-medium text-black">
                      Add Ingredient
                    </Text>
                  </View>
                  <View className="relative flex h-20 w-full items-center justify-center p-4">
                    <Search className="absolute top-[28px] left-7 z-10 text-black" />
                    <TextInput
                      placeholder="Search for ingredient"
                      className="h-full w-full rounded-lg border border-gray-600 pr-4 pl-12 text-lg"
                    />
                  </View>
                </View>
                <View className="w-full flex-1 overflow-auto">
                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgb(255 237 213)",
                      "rgb(254 215 170)",
                    ]}
                    locations={[0.01, 0.05, 1]}
                    className="w-full flex-1"
                  >
                    <View className="flex w-full flex-1 flex-row flex-wrap items-center overflow-auto  pt-4">
                      <FlashList
                        data={[...ingredientsAll]}
                        numColumns={2}
                        estimatedItemSize={32}
                        renderItem={({ item }) => (
                          <View
                            key={item.id}
                            className={`mx-auto flex items-center self-center`}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                ingredientSetValue("ingredientId", item.id);
                              }}
                              className="my-2 flex h-16 w-32 justify-center rounded-xl bg-slate-600"
                              style={{
                                shadowColor: "#000",
                                shadowOffset: {
                                  width: 0,
                                  height: 2,
                                },
                                shadowOpacity: 1,
                                shadowRadius: 8,
                                elevation: 12,
                              }}
                            >
                              <Text className="text-center text-lg font-medium text-white">
                                {item.name.toLocaleUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      />
                    </View>
                  </LinearGradient>
                </View>
              </>
            )}

            {ingredientInputVisible === "unit" && (
              <>
                <View className="relative flex w-full items-center gap-y-2 overflow-auto pt-8 pb-2">
                  <LinearGradient
                    colors={["rgba(0,0,0,0.1)", "transparent"]}
                    locations={[0.2, 1]}
                    style={{
                      position: "absolute",
                      bottom: -25,
                      left: 0,
                      right: 0,
                      height: 10,
                    }}
                  />
                  <View className="flex w-full flex-row items-center justify-center ">
                    <Text className="text-lg font-medium text-black">
                      Select Unit
                    </Text>
                  </View>
                </View>

                <LinearGradient
                  colors={[
                    "transparent",
                    "rgb(255 237 213)",
                    "rgb(254 215 170)",
                  ]}
                  locations={[0.01, 0.05, 1]}
                  className="w-full flex-1"
                >
                  <View className="flex w-full flex-1 flex-row flex-wrap items-center overflow-auto  pt-4">
                    <FlashList
                      data={[...unitsAll]}
                      numColumns={2}
                      estimatedItemSize={32}
                      renderItem={({ item }) => {
                        return (
                          <View
                            key={item.id}
                            className={`mx-auto flex items-center self-center`}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                ingredientSetValue("unitId", item.id);

                                setIngredientInputVisible("ingredient");
                              }}
                              className="my-2 flex h-16 w-32 justify-center rounded-xl bg-slate-600"
                              style={{
                                shadowColor: "#000",
                                shadowOffset: {
                                  width: 0,
                                  height: 2,
                                },
                                shadowOpacity: 1,
                                shadowRadius: 8,
                                elevation: 12,
                              }}
                            >
                              <Text className="text-center text-lg font-medium text-white">
                                {item.name.toLocaleUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }}
                    />
                  </View>
                </LinearGradient>
              </>
            )}
            {ingredientInputVisible === "amount" && (
              <View className="flex w-full items-center gap-2 py-8">
                <View className="relative flex w-full flex-row items-center justify-center ">
                  <Text className="text-lg font-medium text-black">Amount</Text>
                </View>
                <View className="relative flex h-20 w-full items-center justify-center p-4">
                  <Controller
                    control={ingredientControl}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        keyboardType="phone-pad"
                        onSubmitEditing={() => {
                          setIngredientInputVisible("unit");
                        }}
                        className="h-full w-full rounded-lg border border-gray-600 px-4 text-lg"
                        onChangeText={(value) => {
                          onChange(value.replace(/[^0-9]/g, ""));
                        }}
                        value={value?.toString().replace(/[^0-9]/g, "")}
                        placeholder="Amount"
                      />
                    )}
                    name="amount"
                    rules={{ required: true }}
                  />
                </View>
              </View>
            )}
          </View>

          <View className="relative flex h-32 w-full items-center px-4 pt-4">
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.1)"]}
              locations={[0.5, 1]}
              style={{
                position: "absolute",
                top: -10,
                left: 0,
                right: 0,
                height: 10,
              }}
            />
            <View className="flex w-full items-center rounded-lg bg-orange-500 px-4 py-2">
              <View className="mb-2 flex flex-row items-center gap-x-2">
                <TouchableOpacity
                  onPress={() => {
                    setIngredientInputVisible("amount");
                  }}
                  className={`min-w-[40px] flex-1 justify-center bg-green-500 p-2`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 12,
                  }}
                >
                  <Text className="text-md text-center font-medium text-white">
                    {ingredientWatch("amount") || "AMOUNT"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIngredientInputVisible("unit");
                  }}
                  className={`min-w-[40px] flex-1 justify-center bg-violet-500 p-2`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 12,
                  }}
                >
                  <Text className="text-md text-center font-medium text-white">
                    {unitsAll
                      .find(({ id }) => id === ingredientWatch("unitId"))
                      ?.name.toLocaleUpperCase() || "UNIT"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIngredientInputVisible("ingredient");
                  }}
                  className={`min-w-[40px] flex-1 justify-center bg-teal-500 p-2`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 12,
                  }}
                >
                  <Text className="text-md text-center font-medium text-white">
                    {ingredientsAll
                      .find(({ id }) => id === ingredientWatch("ingredientId"))
                      ?.name.toLocaleUpperCase() || "INGREDIENT"}
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
                    className={`min-w-[40px] justify-center rounded-xl p-2 ${
                      disabled ? "bg-slate-400" : "bg-blue-400"
                    }`}
                  >
                    <Text className="text-lg font-bold text-white">
                      SAVE AND RETURN
                    </Text>
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
                    className={`min-w-[40px]  justify-center rounded-xl ${
                      disabled ? "bg-slate-700" : "bg-blue-700"
                    } p-2`}
                  >
                    <Text className="text-lg font-bold text-white">
                      ADD NEXT
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {mode === "edit" && (
                <View className="flex flex-row gap-x-2">
                  <TouchableOpacity
                    disabled={disabled}
                    onPress={() => {
                      setIngredientsModalVisible(false);
                      setMode("create");
                      ingredientReset();
                      setIngredientInputVisible("amount");
                    }}
                    className={`min-w-[40px] justify-center rounded-xl p-2 ${
                      disabled ? "bg-slate-400" : "bg-blue-400"
                    }`}
                  >
                    <Text className="text-lg font-bold text-white">CANCEL</Text>
                  </TouchableOpacity>
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
                    className={`min-w-[40px]  justify-center rounded-xl ${
                      disabled ? "bg-slate-700" : "bg-blue-700"
                    } p-2`}
                  >
                    <Text className="text-lg font-bold text-white">UPDATE</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
