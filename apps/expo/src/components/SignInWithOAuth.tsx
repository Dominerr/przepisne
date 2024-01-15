import { useOAuth } from "@clerk/clerk-expo";
import React from "react";
import { Text, Image, TouchableOpacity, View } from "react-native";
import { useWarmUpBrowser } from "../hooks/useWarmUpBrowser";
import * as AuthSession from "expo-auth-session";

const SignInWithOAuth = () => {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleSignInWithGooglePress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();
      console.log(setActive, createdSessionId);
      if (createdSessionId) {
        setActive?.({ session: createdSessionId });
      } else {
        if (!signIn) {
          throw new Error("You must provide signIn");
        }
        const redirectUrl = AuthSession.makeRedirectUri({
          path: "/oauth-native-callback",
        });

        await signIn?.create({
          strategy: "oauth_google",
          redirectUrl,
        });

        const {
          firstFactorVerification: { externalVerificationRedirectURL },
        } = signIn;

        if (!externalVerificationRedirectURL) {
          throw "Something went wrong, please try again.";
        }

        const authResult = await AuthSession.startAsync({
          authUrl: externalVerificationRedirectURL.toString(),
          returnUrl: redirectUrl,
        });

        if (authResult.type !== "success") {
          throw "Something went wrong, please try again.";
        }

        const { rotating_token_nonce: rotatingTokenNonce } = authResult.params;

        await signIn.reload({ rotatingTokenNonce });

        const { createdSessionId } = signIn;

        if (createdSessionId) {
          setActive?.({ session: createdSessionId });
        } else {
          if (!signUp || signIn.firstFactorVerification.status !== "verified") {
            throw "Something went wrong, please try again.";
          }
        }

        console.log("Creating new account");

        await signUp?.create({ transfer: true });
        await signUp?.reload({
          rotatingTokenNonce: authResult.params.rotating_token_nonce,
        });
        await setActive?.({ session: signUp?.createdSessionId });

        // Modify this code to use signIn or signUp to set this missing requirements you set in your dashboard.
        throw new Error(
          "There are unmet requirements, modifiy this else to handle them",
        );
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      console.log("error signing in", err);
    }
  }, []);

  return (
    <TouchableOpacity
      onPress={handleSignInWithGooglePress}
      className="relative flex w-4/5 flex-row items-center justify-center gap-x-4 rounded-md border-2 border-gray-500 p-4"
    >
      <Image
        className="absolute left-2"
        source={require("../../../expo/assets/google-icon.png")}
        style={{ width: 30, height: 30 }}
      />
      <Text className="text-xl font-medium">Sign in with Google</Text>
    </TouchableOpacity>
  );
};

export default SignInWithOAuth;
