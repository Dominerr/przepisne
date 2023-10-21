import { router } from "../trpc";
import { recipeRouter } from "./recipe";
import { authRouter } from "./auth";

export const appRouter = router({
  recipe: recipeRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
