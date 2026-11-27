/**
 * Fields shared by the four OAuth 2.0 flow types.
 */
interface OAuthFlowCommon {
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface OAuthImplicitFlow extends OAuthFlowCommon {
  authorizationUrl: string;
}

export interface OAuthPasswordFlow extends OAuthFlowCommon {
  tokenUrl: string;
}

export interface OAuthClientCredentialsFlow extends OAuthFlowCommon {
  tokenUrl: string;
}

export interface OAuthAuthorizationCodeFlow extends OAuthFlowCommon {
  authorizationUrl: string;
  tokenUrl: string;
}

export interface OAuthFlows {
  implicit?: OAuthImplicitFlow;
  password?: OAuthPasswordFlow;
  clientCredentials?: OAuthClientCredentialsFlow;
  authorizationCode?: OAuthAuthorizationCodeFlow;
}

/**
 * Authentication scheme declared under `components.securitySchemes`.
 */
export type SecurityScheme = (
  | { type: 'apiKey'; name: string; in: 'query' | 'header' | 'cookie' }
  | { type: 'http'; scheme: string; bearerFormat?: string }
  | { type: 'oauth2'; flows: OAuthFlows }
  | { type: 'openIdConnect'; openIdConnectUrl: string }
  | { type: 'mutualTLS' }
) & {
  description?: string;
};
