import { specificationApiPath, type SpecificationInput } from '../specification-contract';

export async function startSpecificationJob(input: SpecificationInput): Promise<void> {
  const response = await fetch(specificationApiPath, {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Specification conversion could not start (${response.status}).`);
  }
}
