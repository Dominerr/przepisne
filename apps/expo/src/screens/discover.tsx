import { Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { trpc } from "../utils/trpc";
import { StackScreenProps } from "@react-navigation/stack";
import { RootParamList } from "../components/TabNavigation";

type DiscoverScreenProps = StackScreenProps<RootParamList, "Discover">;

export const DiscoverScreen = ({ navigation }: DiscoverScreenProps) => {
  const recipeQuery = trpc.recipe.all.useQuery();

  return (
    <SafeAreaView className="bg-white">
      <View className="h-full w-full px-4">
        <Text className="pb-2 text-5xl font-bold text-black">Discover</Text>
        <Text className="pb-2 text-2xl font-semibold text-black">
          Search for recipes:
        </Text>
      </View>
    </SafeAreaView>
  );
};
