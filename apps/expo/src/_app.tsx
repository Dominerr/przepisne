import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TRPCProvider } from "./utils/trpc";

import { SignInSignUpScreen } from "./screens/signin";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { tokenCache } from "./utils/cache";
import Constants from "expo-constants";

import { NavigationContainer } from "@react-navigation/native";

import { TabNavigator } from "./components/TabNavigation";

export const App = () => {
  return (
    <ClerkProvider
      publishableKey={Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <TRPCProvider>
        <SignedIn>
          <NavigationContainer>
            <SafeAreaProvider>
              <TabNavigator />

              <StatusBar />
            </SafeAreaProvider>
          </NavigationContainer>
        </SignedIn>
        <SignedOut>
          <SignInSignUpScreen />
        </SignedOut>
      </TRPCProvider>
    </ClerkProvider>
  );
};
