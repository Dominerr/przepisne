import * as z from "zod";

export const recipeSchema = z.object({
  name: z.string().min(1),
  instructions: z.array(
    z.object({
      instruction: z.string(),
    }),
  ),
  authorId: z.string().min(1),
  ingredients: z
    .array(
      z.object({
        amount: z.number(),
        ingredientId: z.string(),
        unitId: z.string(),
      }),
    )
    .min(1),
});

export type RecipeForm = z.infer<typeof recipeSchema>;
