import { router, publicProcedure } from "../trpc";

export const helperRouter = router({
  allUnits: publicProcedure.query(async ({ ctx }) => {
    const units = await ctx.prisma.unit.findMany();
    return units;
  }),
  allIngredients: publicProcedure.query(async ({ ctx }) => {
    const ingredients = await ctx.prisma.ingredient.findMany();
    return ingredients;
  }),
});
