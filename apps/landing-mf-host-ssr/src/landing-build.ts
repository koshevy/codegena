export interface LandingBuild {
  buildId: string;
  clientRoot: string;
  indexHtml: string;
  renderLanding: (request: Request) => Promise<string>;
}
