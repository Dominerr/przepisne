import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/dist/api";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddresses: user.emailAddresses,
    profileImageUrl: user.profileImageUrl,
  };
};

export const recipeRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    const recipes = await ctx.prisma.recipe.findMany();

    const users = (
      await clerkClient.users.getUserList({
        userId: recipes.map((recipe) => recipe.authorId),
      })
    ).map(filterUserForClient);

    return recipes.map((recipe) => {
      const author = users.find((user) => user.id === recipe.authorId);
      return {
        ...recipe,
        author,
      };
    });
  }),
  byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.recipe.findFirst({ where: { id: input } });
  }),
  byAuthorId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.recipe.findMany({ where: { authorId: input } });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        instructions: z.string(),
        authorId: z.string(),
        ingredients: z.array(
          z.object({
            amount: z.number(),
            ingredientId: z.string(),
            unitId: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { ingredients, ...rest } = input;

      // Step 1: Create the new recipe
      const createdRecipe = await ctx.prisma.recipe.create({
        data: {
          ...rest,
        },
      });

      // Step 2: Create the associated RecipeIngredients and ensure they are connected to the new recipe
      const recipeIngredients = ingredients.map((ingredient) => ({
        amount: ingredient.amount,
        ingredientId: ingredient.ingredientId,
        unitId: ingredient.unitId,
        recipeId: createdRecipe.id, // Connect the RecipeIngredient to the new Recipe
      }));

      // Use Prisma to create the RecipeIngredients
      ctx.prisma.recipeIngredient.createMany({
        data: recipeIngredients,
      });

      return createdRecipe;
    }),
});
