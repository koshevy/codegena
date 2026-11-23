import type { PreparedSpecification } from './specification-contract';
import { SpecificationJobs } from './specification-jobs';

describe('SpecificationJobs', () => {
  it('aborts pending conversion and releases its result', async () => {
    const conversion = Promise.withResolvers<PreparedSpecification>();
    const run = jest.fn((_input: unknown, _signal: AbortSignal) => conversion.promise);
    const jobs = new SpecificationJobs(run);
    const id = crypto.randomUUID();

    jobs.start({ id, specUrl: '/specifications/account.json' });

    const signal = run.mock.calls[0]?.[1];

    expect(jobs.get(id)).toEqual({ status: 'pending' });
    expect(signal?.aborted).toBe(false);
    jobs.cancel(id);
    expect(signal?.aborted).toBe(true);
    expect(jobs.get(id)).toBeUndefined();

    conversion.resolve({ serializedGraph: '{}', sourceSchemaText: '' });
    await conversion.promise;
    expect(jobs.get(id)).toBeUndefined();
  });

  it('keeps separate conversions independent until they are released', async () => {
    const run = jest.fn(async ({ specUrl }: { specUrl: string }) => ({
      serializedGraph: '{}', sourceSchemaText: specUrl,
    }));
    const jobs = new SpecificationJobs(run);
    const first = crypto.randomUUID();
    const second = crypto.randomUUID();

    jobs.start({ id: first, specUrl: '/first.json' });
    jobs.start({ id: second, specUrl: '/second.json' });

    await Promise.all(run.mock.results.map(({ value }) => value));

    expect(jobs.get(first)).toEqual({
      status: 'ready',
      value: { serializedGraph: '{}', sourceSchemaText: '/first.json' },
    });
    jobs.cancel(first);
    expect(jobs.get(first)).toBeUndefined();
    expect(jobs.get(second)).toEqual({
      status: 'ready',
      value: { serializedGraph: '{}', sourceSchemaText: '/second.json' },
    });
    jobs.cancel(second);
  });

  it('reports conversion failure until its owner releases the job', async () => {
    const run = jest.fn(async () => {
      throw new Error('Invalid specification.');
    });

    const jobs = new SpecificationJobs(run);
    const id = crypto.randomUUID();

    jobs.start({ id, specUrl: '/invalid.json' });

    await Promise.allSettled(run.mock.results.map(({ value }) => value));

    expect(jobs.get(id)).toEqual({
      message: 'Invalid specification.',
      status: 'failed',
    });
    jobs.cancel(id);
    expect(jobs.get(id)).toBeUndefined();
  });
});
