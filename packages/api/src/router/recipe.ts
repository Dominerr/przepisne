import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import type { User } from "@clerk/nextjs/api";
import { TRPCError } from "@trpc/server";

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
        author: true,
      },
    });

    return recipes;
  }),
  favourite: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      }),
    )
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
              author: true,
            },
          },
        },
        skip: input?.cursor ? 1 : undefined,
        take: input?.limit,
        cursor: input?.cursor
          ? {
              userId_recipeId: {
                userId: input.userId,
                recipeId: input.cursor,
              },
            }
          : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });

      const lastRecipe = recipes[recipes.length - 1];
      const nextCursor = lastRecipe?.recipeId;

      return {
        recipes,
        nextCursor,
      };
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
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
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
          author: true,
        },
        skip: input?.cursor ? 1 : undefined,
        take: input?.limit,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
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

      const lastRecipe = recipes[recipes.length - 1];
      const nextCursor = lastRecipe?.id;

      return {
        recipes,
        nextCursor,
      };
    }),
  byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.recipe.findFirst({ where: { id: input } });
  }),
  byAuthorId: publicProcedure
    .input(
      z.object({
        authorId: z.string(),
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { authorId, limit, cursor } = input;

      const recipes = await ctx.prisma.recipe.findMany({
        where: { authorId },
        include: {
          ingredients: true,
          instructions: true,
          savedByUsers: true,
          author: true,
        },
        skip: cursor ? 1 : undefined,
        take: limit,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });

      const lastRecipe = recipes[recipes.length - 1];
      const nextCursor = lastRecipe?.id;

      return {
        recipes,
        nextCursor,
      };
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

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, userId } = input;

      const recipe = await ctx.prisma.recipe.findFirst({
        where: {
          id,
          authorId: userId,
        },
      });

      if (!recipe) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this recipe",
        });
      }

      await ctx.prisma.recipe.delete({
        where: {
          id,
        },
      });
    }),
});
