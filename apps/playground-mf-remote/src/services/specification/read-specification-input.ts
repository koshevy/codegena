import { specificationInputSchema } from './specification-contract';

export async function readSpecificationInput(
  request: Request,
): Promise<ReturnType<typeof specificationInputSchema.safeParse>> {
  try {
    const input: unknown = await request.json();

    return specificationInputSchema.safeParse(input);
  }
  catch {
    return specificationInputSchema.safeParse(null);
  }
}
