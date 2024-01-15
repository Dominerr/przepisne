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
        savedByUsers: true,
      },
    });

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
  favourite: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const recipes = await ctx.prisma.savedRecipe.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          recipe: {
            include: {
              ingredients: true,
              instructions: true,
              savedByUsers: true,
            },
          },
        },
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: recipes.map((savedRecipe) => savedRecipe.recipe.authorId),
        })
      ).map(filterUserForClient);

      return recipes.map((savedRecipe) => {
        const author = users.find(
          (user) => user.id === savedRecipe.recipe.authorId,
        );
        return {
          ...savedRecipe.recipe,
          author,
        };
      });
    }),
  changeFavouriteStatus: protectedProcedure
    .input(
      z.object({
        recipeId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { recipeId, userId } = input;
      const savedRecipe = await ctx.prisma.savedRecipe.findFirst({
        where: {
          recipeId,
          userId,
        },
      });

      if (savedRecipe) {
        await ctx.prisma.savedRecipe.delete({
          where: {
            userId_recipeId: {
              userId,
              recipeId,
            },
          },
        });
      } else {
        await ctx.prisma.savedRecipe.create({
          data: {
            recipeId,
            userId,
          },
        });
      }
    }),

  search: publicProcedure
    .input(
      z.object({
        search: z.string(),
        ingredients: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ingredientConditions = input.ingredients.map((ingredientId) => ({
        ingredients: {
          some: {
            ingredientId: {
              equals: ingredientId,
            },
          },
        },
      }));

      const recipes = await ctx.prisma.recipe.findMany({
        include: {
          ingredients: true,
          instructions: true,
          savedByUsers: true,
        },
        where: {
          AND: [
            {
              name: {
                contains: input.search,
              },
            },
            ...ingredientConditions,
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });

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
        timeRequired: z.string(),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
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
