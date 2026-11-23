export async function fetchFixtureText(
  fixtureName: string,
  fixtureBaseUrl: string,
): Promise<string> {
  const fixtureBase = fixtureBaseUrl.replace(/[/\s]+$/, '');
  const response = await fetch(`${fixtureBase}/${encodeURIComponent(fixtureName)}`);

  if (!response.ok) {
    throw new Error(`Fixture ${fixtureName} returned HTTP ${response.status}.`);
  }

  return response.text();
}
