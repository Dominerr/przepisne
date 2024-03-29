import { useEffect, useRef, useState } from "react";

import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  ToastAndroid,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";

import { trpc } from "../utils/trpc";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import Delete from "../assets/icons/Delete";
import { RecipeForm, recipeSchema } from "../api/recipe";
import { CustomTextInput } from "./CustomTextInput";
import { useSwipe } from "../hooks/useSwipe";
import Fire from "../assets/icons/Fire";
import { CustomButton } from "./CustomButton";

const nextInputVisible = (
  currentInputVisible: "ingredient" | "unit" | "amount",
) => {
  switch (currentInputVisible) {
    case "amount":
      return "unit";
    case "unit":
      return "ingredient";
    case "ingredient":
      return "amount";
  }
};

const previousInputVisible = (
  currentInputVisible: "ingredient" | "unit" | "amount",
) => {
  switch (currentInputVisible) {
    case "amount":
      return "ingredient";
    case "unit":
      return "amount";
    case "ingredient":
      return "unit";
  }
};

export const CreateRecipe = () => {
  const instructionsInputRefs = useRef<TextInput[]>([]);
  const amountInputRef = useRef<TextInput>(null);
  const utils = trpc.useContext();
  const [ingredientsModalVisible, setIngredientsModalVisible] = useState(false);
  const [difficultyPanelVisible, setDifficultyPanelVisible] = useState(false);
  const [timeRequiredPanelVisible, setTimeRequiredPanelVisible] =
    useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [ingredientInputVisible, setIngredientInputVisible] = useState<
    "ingredient" | "unit" | "amount"
  >("amount");

  const { onTouchEnd, onTouchStart } = useSwipe(
    () => {
      setIngredientInputVisible(nextInputVisible(ingredientInputVisible));
    },
    () => {
      setIngredientInputVisible(previousInputVisible(ingredientInputVisible));
    },
    6,
  );

  const [indexToEdit, setIndexToEdit] = useState(0);

  const [instructionsModalVisible, setInstructionsModalVisible] =
    useState(false);

  const {
    control: searchControl,
    watch: searchWatch,
    reset: searchReset,
  } = useForm({
    defaultValues: {
      unitSearch: "",
      ingredientSearch: "",
    },
  });

  const { data: ingredientsAll, isSuccess: areIngredientsSuccess } =
    trpc.helper.allIngredients.useQuery();
  const { data: unitsAll, isSuccess: areUnitsSuccess } =
    trpc.helper.allUnits.useQuery();

  const filteredUnits = (unitsAll || []).filter((unit) =>
    unit.name.toLowerCase().includes(searchWatch("unitSearch").toLowerCase()),
  );

  const filteredIngredients = (ingredientsAll || []).filter((ingredient) =>
    ingredient.name
      .toLowerCase()
      .includes(searchWatch("ingredientSearch").toLowerCase()),
  );

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
      difficulty: "Easy",
      timeRequired: "15",
      authorId: user?.id,
    },
  });

  const prevLengthRef = useRef(watch("instructions").length);

  const { mutate: addRecipe } = trpc.recipe.create.useMutation({
    async onSuccess() {
      ToastAndroid.show("Recipe created", ToastAndroid.SHORT);
      reset();
      await utils.recipe.invalidate();
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

  const nonEmptyInstructions = watch("instructions").filter(
    ({ instruction }) => instruction !== "",
  );

  const disabled =
    !ingredientWatch("amount") ||
    !ingredientWatch("unitId") ||
    !ingredientWatch("ingredientId");

  const onSubmit = handleSubmit(({ instructions, ...rest }) => {
    addRecipe({
      ...rest,
      instructions: nonEmptyInstructions.map((instruction, index) => {
        return {
          ...instruction,
          step: index + 1,
        };
      }),
    });
  });

  const numberOfIngredients = watch("ingredients").length;

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

          {getValues("ingredients").length > 0 && (
            <View>
              <Text className="text-sm font-medium">Ingredients</Text>
              <View className="my-2 w-full rounded py-2">
                {getValues("ingredients").map((item, index) => (
                  <View
                    key={`${item.ingredientId} ${item.unitId} ${index}`}
                    className="flex w-full flex-row items-center justify-center"
                  >
                    <CustomButton
                      className="mr-2 flex-1"
                      onPress={() => {
                        ingredientSetValue("amount", item.amount);
                        ingredientSetValue("unitId", item.unitId);
                        ingredientSetValue("ingredientId", item.ingredientId);
                        setMode("edit");
                        setIngredientInputVisible("amount");
                        setIngredientsModalVisible(true);
                        setIndexToEdit(index);
                      }}
                    >
                      <Text className="text-md min-w-[60px] rounded-lg text-center font-medium text-white">
                        {item.amount}
                      </Text>
                    </CustomButton>
                    <CustomButton
                      className="mr-2 flex-1"
                      onPress={() => {
                        ingredientSetValue("amount", item.amount);
                        ingredientSetValue("unitId", item.unitId);
                        ingredientSetValue("ingredientId", item.ingredientId);
                        setMode("edit");
                        setIngredientInputVisible("unit");
                        setIngredientsModalVisible(true);
                        setIndexToEdit(index);
                      }}
                    >
                      <Text className="text-md min-w-[60px] rounded-lg text-center font-medium text-white">
                        {unitsAll.find(({ id }) => id === item.unitId)?.name}
                      </Text>
                    </CustomButton>
                    <Text className="max-w-[20px] flex-1">of</Text>
                    <CustomButton
                      className="ml-2 flex-1"
                      onPress={() => {
                        ingredientSetValue("amount", item.amount);
                        ingredientSetValue("unitId", item.unitId);
                        ingredientSetValue("ingredientId", item.ingredientId);
                        setMode("edit");
                        setIngredientInputVisible("ingredient");
                        setIngredientsModalVisible(true);
                        setIndexToEdit(index);
                      }}
                    >
                      <Text className="text-md min-w-[60px] rounded-lg text-center font-medium text-white">
                        {
                          ingredientsAll.find(
                            ({ id }) => id === item.ingredientId,
                          )?.name
                        }
                      </Text>
                    </CustomButton>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="my-3">
            <CustomButton
              onPress={() => setIngredientsModalVisible(true)}
              className="bg-ted-300"
            >
              <Text className="text-md font-medium leading-none text-white">
                Add ingredients
              </Text>
            </CustomButton>
            {errors.ingredients && (
              <Text className="text-sm font-medium leading-none text-red-500">
                Please add at least one ingredient
              </Text>
            )}
          </View>

          {nonEmptyInstructions.length > 0 && (
            <View>
              <Text className="text-sm font-medium">Instructions</Text>
              <View className="my-2 w-full rounded p-2">
                {nonEmptyInstructions.map((item, index) => (
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
          )}

          {nonEmptyInstructions.length === 0 ? (
            <CustomButton
              onPress={() => {
                setInstructionsModalVisible(true);
                if (watch("instructions").length === 0) {
                  setValue(`instructions.${watch("instructions").length}`, {
                    instruction: "",
                  });
                }
              }}
            >
              <Text className="text-md font-medium leading-none text-white">
                Add instructions
              </Text>
            </CustomButton>
          ) : (
            <CustomButton
              onPress={() => {
                setInstructionsModalVisible(true);
              }}
            >
              <Text className="text-md font-medium leading-none text-white">
                Edit instructions
              </Text>
            </CustomButton>
          )}

          <View className="flex-row justify-between py-4">
            <View>
              <Text className="mb-2 text-sm font-medium leading-none">
                Select difficulty
              </Text>
              {difficultyPanelVisible ? (
                <View className="items-center justify-center gap-y-2">
                  <CustomButton
                    className="w-[120px] flex-row items-center justify-center"
                    onPress={() => {
                      setValue("difficulty", "Easy");
                      setDifficultyPanelVisible((prev) => !prev);
                    }}
                  >
                    <Fire className="text-green-400" />
                    <Text className="text-center text-base text-white">
                      Easy
                    </Text>
                  </CustomButton>
                  <CustomButton
                    className="w-[120px] flex-row items-center justify-center"
                    onPress={() => {
                      setValue("difficulty", "Medium");
                      setDifficultyPanelVisible((prev) => !prev);
                    }}
                  >
                    <Fire className="text-orange-500" />
                    <Text className="text-base text-white">Medium</Text>
                  </CustomButton>
                  <CustomButton
                    className="w-[120px] flex-row items-center justify-center"
                    onPress={() => {
                      setValue("difficulty", "Hard");
                      setDifficultyPanelVisible((prev) => !prev);
                    }}
                  >
                    <Fire className="text-red-500" />
                    <Text className="text-base text-white">Hard</Text>
                  </CustomButton>
                </View>
              ) : (
                <CustomButton
                  className="w-[120px] flex-row items-center justify-center"
                  onPress={() => {
                    setDifficultyPanelVisible((prev) => !prev);
                  }}
                >
                  <Fire
                    className={
                      watch("difficulty") === "Easy"
                        ? "text-green-400"
                        : watch("difficulty") === "Medium"
                        ? "text-orange-500"
                        : "text-red-500"
                    }
                  />
                  <Text className="text-base text-white">
                    {watch("difficulty")}
                  </Text>
                </CustomButton>
              )}
            </View>
            <View>
              <Text className="mb-2 text-sm font-medium leading-none">
                Select time
              </Text>
              {timeRequiredPanelVisible ? (
                <View className="flex-row items-center gap-x-1">
                  <View className="items-center justify-center gap-y-1">
                    <CustomButton
                      className="w-[58px] flex-row items-center justify-center"
                      onPress={() => {
                        setValue("timeRequired", "15");
                        setTimeRequiredPanelVisible((prev) => !prev);
                      }}
                    >
                      <Text className="leading-4 text-white">15</Text>
                      <Text className="leading-4 text-white">min</Text>
                    </CustomButton>
                    <CustomButton
                      className="w-[58px] flex-row items-center justify-center"
                      onPress={() => {
                        setValue("timeRequired", "45");
                        setTimeRequiredPanelVisible((prev) => !prev);
                      }}
                    >
                      <Text className="leading-4 text-white">45</Text>
                      <Text className="leading-4 text-white">min</Text>
                    </CustomButton>
                    <CustomButton
                      className="w-[58px] flex-row items-center justify-center"
                      onPress={() => {
                        setValue("timeRequired", "75");
                        setTimeRequiredPanelVisible((prev) => !prev);
                      }}
                    >
                      <Text className="leading-4 text-white">75</Text>
                      <Text className="leading-4 text-white">min</Text>
                    </CustomButton>
                  </View>
                  <View className="items-center justify-center gap-y-1">
                    <CustomButton
                      className="w-[58px] flex-row items-center justify-center"
                      onPress={() => {
                        setValue("timeRequired", "30");
                        setTimeRequiredPanelVisible((prev) => !prev);
                      }}
                    >
                      <Text className="leading-4 text-white">30</Text>
                      <Text className="leading-4 text-white">min</Text>
                    </CustomButton>
                    <CustomButton
                      className="w-[58px] flex-row items-center justify-center"
                      onPress={() => {
                        setValue("timeRequired", "60");
                        setTimeRequiredPanelVisible((prev) => !prev);
                      }}
                    >
                      <Text className="leading-4 text-white">60</Text>
                      <Text className="leading-4 text-white">min</Text>
                    </CustomButton>
                    <CustomButton
                      className="w-[58px] flex-row items-center justify-center"
                      onPress={() => {
                        setValue("timeRequired", "90");
                        setTimeRequiredPanelVisible((prev) => !prev);
                      }}
                    >
                      <Text className="leading-4 text-white">90</Text>
                      <Text className="leading-4 text-white">min</Text>
                    </CustomButton>
                  </View>
                </View>
              ) : (
                <CustomButton
                  className="w-[120px] flex-row items-center justify-center"
                  onPress={() => {
                    setTimeRequiredPanelVisible((prev) => !prev);
                  }}
                >
                  <Text className="text-base text-white">
                    {watch("timeRequired")}
                  </Text>
                  <Text className="text-base text-white">min</Text>
                </CustomButton>
              )}
            </View>
          </View>
          <CustomButton type="secondary" onPress={onSubmit}>
            <Text className="text-lg font-bold leading-none text-white">
              Save recipe
            </Text>
          </CustomButton>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        visible={instructionsModalVisible}
        onShow={() => {
          setTimeout(() => {
            instructionsInputRefs.current[
              instructionsInputRefs.current.length - 1
            ]?.focus();
          }, 100);
        }}
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
                  keyboardShouldPersistTaps="always"
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
                              className="mb-[18px] ml-2 w-min"
                              onPress={() => {
                                setValue(
                                  "instructions",
                                  watch("instructions").filter(
                                    (_, i) => i !== index,
                                  ),
                                );
                              }}
                            >
                              <Delete className="text-red-500" />
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

            <View className="flex flex-row gap-x-2">
              <CustomButton
                disabled={isLastInstructionEmpty}
                className={`flex-1 ${
                  isLastInstructionEmpty ? "opacity-30" : "opacity-100"
                }`}
                onPress={() => {
                  setValue(`instructions.${watch("instructions").length}`, {
                    instruction: "",
                  });
                }}
              >
                <Text className="text-md font-medium text-white">
                  Add another
                </Text>
              </CustomButton>

              <CustomButton
                disabled={isLastInstructionEmpty}
                className={`flex-1 ${
                  isLastInstructionEmpty ? "opacity-30" : "opacity-100"
                }`}
                type="secondary"
                onPress={() => {
                  setInstructionsModalVisible(false);
                }}
              >
                <Text className="text-md font-medium text-white">Save</Text>
              </CustomButton>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        visible={ingredientsModalVisible}
        onShow={() => {
          setTimeout(() => {
            amountInputRef.current?.focus();
          }, 100);
        }}
        onRequestClose={() => {
          setIngredientsModalVisible((prev) => !prev);
        }}
      >
        <View
          className="flex h-full bg-gray-100 p-4"
          onTouchEnd={onTouchEnd}
          onTouchStart={onTouchStart}
        >
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
                          ref={amountInputRef}
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
                      control={searchControl}
                      render={({ field: { onChange, value } }) => (
                        <CustomTextInput
                          onSubmitEditing={() => {
                            setIngredientInputVisible("unit");
                          }}
                          onChangeText={onChange}
                          value={value}
                          placeholder="Search for unit"
                          label="Select unit"
                        />
                      )}
                      name="unitSearch"
                      rules={{ required: true }}
                    />
                  </View>

                  <View className="mt-4 flex h-[250px] w-full">
                    <FlashList
                      data={[...filteredUnits]}
                      keyboardShouldPersistTaps="always"
                      numColumns={2}
                      estimatedItemSize={32}
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
                      control={searchControl}
                      render={({ field: { onChange, value } }) => (
                        <CustomTextInput
                          onSubmitEditing={() => {
                            setIngredientInputVisible("unit");
                          }}
                          onChangeText={onChange}
                          value={value}
                          placeholder="Search for ingredient"
                          label="Select ingredient"
                        />
                      )}
                      name="ingredientSearch"
                    />
                  </View>

                  <View className="mt-4 flex h-[250px] w-full">
                    <FlashList
                      data={[...filteredIngredients]}
                      keyboardShouldPersistTaps="always"
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
                  <CustomButton
                    onPress={() => {
                      setIngredientInputVisible("amount");
                    }}
                  >
                    <Text
                      className={`text-md min-w-[60px] rounded-lg text-center font-medium ${
                        ingredientInputVisible === "amount"
                          ? "text-teal-600"
                          : "text-white"
                      }`}
                    >
                      {ingredientWatch("amount") || "..."}
                    </Text>
                  </CustomButton>
                  <CustomButton
                    onPress={() => {
                      setIngredientInputVisible("unit");
                    }}
                  >
                    <Text
                      className={`text-md min-w-[60px] rounded-lg text-center font-medium ${
                        ingredientInputVisible === "unit"
                          ? "text-teal-600"
                          : "text-white"
                      }`}
                    >
                      {unitsAll.find(
                        ({ id }) => id === ingredientWatch("unitId"),
                      )?.name || "..."}
                    </Text>
                  </CustomButton>
                  <Text>of</Text>
                  <CustomButton
                    onPress={() => {
                      setIngredientInputVisible("ingredient");
                    }}
                  >
                    <Text
                      className={`text-md min-w-[60px] rounded-lg text-center font-medium ${
                        ingredientInputVisible === "ingredient"
                          ? "text-teal-600"
                          : "text-white"
                      }`}
                    >
                      {ingredientsAll.find(
                        ({ id }) => id === ingredientWatch("ingredientId"),
                      )?.name || "..."}
                    </Text>
                  </CustomButton>
                </View>

                {mode === "create" && (
                  <View className="flex flex-row gap-x-2">
                    <CustomButton
                      disabled={disabled}
                      onPress={() => {
                        setValue(`ingredients.${numberOfIngredients}`, {
                          amount: Number(ingredientWatch("amount") || 0),
                          ingredientId: ingredientWatch("ingredientId"),
                          unitId: ingredientWatch("unitId"),
                        });
                        ingredientReset();
                        setIngredientInputVisible("amount");
                        searchReset();
                      }}
                      className={`flex-1 ${
                        disabled ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      <Text className="text-md font-medium text-white">
                        Add another
                      </Text>
                    </CustomButton>

                    <CustomButton
                      type="secondary"
                      disabled={disabled}
                      onPress={() => {
                        setValue(`ingredients.${numberOfIngredients}`, {
                          amount: Number(ingredientWatch("amount") || 0),
                          ingredientId: ingredientWatch("ingredientId"),
                          unitId: ingredientWatch("unitId"),
                        });
                        setIngredientsModalVisible(false);
                        ingredientReset();
                        searchReset();
                        setIngredientInputVisible("amount");
                      }}
                      className={`flex-1 ${
                        disabled ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      <Text className="text-md font-medium text-white">
                        Save
                      </Text>
                    </CustomButton>
                  </View>
                )}
                {mode === "edit" && (
                  <View className="flex flex-row gap-x-2">
                    <CustomButton
                      disabled={disabled}
                      onPress={() => {
                        setIngredientsModalVisible(false);
                        setMode("create");
                        ingredientReset();
                        searchReset();
                        setIngredientInputVisible("amount");
                      }}
                      className={`flex-1 ${
                        disabled ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      <Text className="text-md font-medium text-white">
                        Cancel
                      </Text>
                    </CustomButton>

                    <CustomButton
                      type="secondary"
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
                        searchReset();
                        setIngredientInputVisible("amount");
                      }}
                      className={`flex-1 ${
                        disabled ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      <Text className="text-md font-medium text-white">
                        Update
                      </Text>
                    </CustomButton>
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
