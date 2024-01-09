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
    const recipes = await ctx.prisma.recipe.findMany({
      include: {
        ingredients: true,
        instructions: true,
      },
    });
    console.log("recipes", recipes);

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
        instructions: z.array(
          z.object({
            instruction: z.string(),
            step: z.number(),
          }),
        ),
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
      const { ingredients, instructions, ...rest } = input;

      const recipe = await ctx.prisma.recipe.create({
        data: {
          ...rest,
          ingredients: {
            create: ingredients,
          },
          instructions: {
            create: instructions,
          },
        },
      });

      return recipe;
    }),
});
