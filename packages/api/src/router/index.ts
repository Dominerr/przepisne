import { router } from "../trpc";
import { recipeRouter } from "./recipe";
import { authRouter } from "./auth";
import { helperRouter } from "./helper";

export const appRouter = router({
  recipe: recipeRouter,
  auth: authRouter,
  helper: helperRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
