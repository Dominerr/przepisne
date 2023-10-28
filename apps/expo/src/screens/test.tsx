import { Text, View } from "react-native";

export const TestScreen = () => {
  return (
    <View className="h-full w-full p-4">
      <Text className="mx-auto pb-2 text-5xl font-bold text-white">
        Create <Text className="text-[#cc66ff]">T3</Text> Turbo
      </Text>

      <View className="py-2">
        <Text className="font-semibold italic text-white">test</Text>
      </View>
    </View>
  );
};
