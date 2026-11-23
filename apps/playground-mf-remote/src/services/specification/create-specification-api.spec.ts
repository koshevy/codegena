import { createSpecificationApi } from './create-specification-api';

describe('createSpecificationApi', () => {
  it('rejects foreign URLs before starting conversion', async () => {
    const convert = jest.fn();
    const handler = createSpecificationApi('https://codegena.test', convert);
    const request = new Request('https://codegena.test/api/specification', {
      body: JSON.stringify({
        id: crypto.randomUUID(),
        specUrl: 'https://foreign.test/schema.json',
      }),
      method: 'POST',
    });

    const response = await handler(request);

    expect(response.status).toBe(403);
    expect(convert).not.toHaveBeenCalled();
  });

  it('rejects invalid job identifiers', async () => {
    const handler = createSpecificationApi('https://codegena.test', jest.fn());

    const response = await handler(new Request(
      'https://codegena.test/api/specification?id=not-a-job',
    ));

    expect(response.status).toBe(400);
  });
});
