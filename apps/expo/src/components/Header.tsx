import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import UserCircle from "../assets/icons/UserCircle";
import SignOut from "../assets/icons/SignOut";

export const Header = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  if (!isLoaded || !isSignedIn) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex h-min flex-row items-center justify-between gap-4 border-b-2 border-gray-200 px-4 py-3"
      style={{
        backgroundColor: modalVisible ? "rgba(0, 0, 0, 0.5)" : "white",
      }}
    >
      <Text className="text-xl font-semibold text-slate-400">Przepisne</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image
          className="h-10 w-10 rounded-full"
          source={{ uri: user.imageUrl }}
        />
      </TouchableOpacity>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            className="mt-[64px] flex-1 items-end justify-end"
            style={{
              backgroundColor: modalVisible ? "rgba(0, 0, 0, 0.5)" : "",
            }}
          >
            <View className="h-48 w-full rounded-tr-2xl rounded-tl-2xl bg-white ">
              <View className="flex flex-row items-center gap-2 px-4 pt-4">
                <Image
                  className="h-6 w-6 rounded-full"
                  source={{ uri: user.imageUrl }}
                />
                <Text className="text-xl font-semibold text-slate-400">
                  {user.fullName}
                </Text>
              </View>
              <View className="my-4 mx-4 h-[1px] bg-slate-400" />

              <View className="flex gap-4">
                <TouchableOpacity
                  className="flex flex-row items-center gap-2 px-4"
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}
                >
                  <UserCircle className="text-gray-700" />
                  <Text className="text-md font-medium text-gray-700">
                    View Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex flex-row items-center gap-2 px-4"
                  onPress={() => {
                    signOut();
                    setModalVisible(!modalVisible);
                  }}
                >
                  <SignOut className="text-gray-700" />
                  <Text className="text-md font-medium text-gray-700">
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};
