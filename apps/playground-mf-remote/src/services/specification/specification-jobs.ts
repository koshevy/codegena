import type {
  ConvertSpecification,
  SpecificationJobResult,
  SpecificationInput,
} from './specification-contract';

interface SpecificationJob {
  controller: AbortController;
  expiry: ReturnType<typeof setTimeout>;
  result: SpecificationJobResult;
}

/**
 * Keep long conversions outside PWA's bounded request/reply channel.
 * Navigation cancels the fetch and dedicated worker; unread jobs expire after
 * five minutes so abandoned pages cannot retain their graphs indefinitely.
 */
export class SpecificationJobs {
  private readonly jobs = new Map<string, SpecificationJob>();

  constructor(private readonly convert: ConvertSpecification) {}

  start(input: SpecificationInput): void {
    const { id } = input;

    if (this.jobs.has(id)) {
      throw new Error('A conversion with this ID already exists.');
    }

    const controller = new AbortController();

    const job: SpecificationJob = {
      controller,
      expiry: setTimeout(() => this.cancel(id), 5 * 60 * 1000),
      result: { status: 'pending' },
    };

    this.jobs.set(id, job);
    void this.convert(input, controller.signal).then((value) => {
      job.result = { status: 'ready', value };
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Conversion failed.';

      job.result = { message, status: 'failed' };
    });
  }

  get(id: string): SpecificationJobResult | undefined {
    return this.jobs.get(id)?.result;
  }

  cancel(id: string): void {
    const job = this.jobs.get(id);

    job?.controller.abort();
    clearTimeout(job?.expiry);
    this.jobs.delete(id);
  }
}
