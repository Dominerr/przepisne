import { StackScreenProps } from "@react-navigation/stack";
import { RootParamList } from "../components/TabNavigation";
import { CreateRecipe } from "../components/CreateRecipe";

type CreateRecipeScreenProps = StackScreenProps<RootParamList, "CreateRecipe">;

export const CreateRecipeScreen = ({}: CreateRecipeScreenProps) => {
  return <CreateRecipe />;
};
