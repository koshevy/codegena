const apiRequestTimestampType = [
  `\`\${number}-\${number}-\${number}T\${number}:`,
  `\${number}:\${number}\${string}\``,
].join('');

export const codeExamples = [
  {
    description: (
      <>
        <code>InlineObjectCompositionPatterns</code> combines object rules and
        patterned keys from an <code>allOf</code> schema into an intersection.
        Its <code>not</code> branches exclude <code>forbiddenProperty</code> and
        {' '}<code>anotherForbiddenProperty</code>, so both appear as optional
        {' '}<code>never</code> properties in the generated type.
      </>
    ),
    fileName: 'inline-object-composition-patterns.ts',
    tooltipTitle: 'Intersection with patterned keys and forbidden properties',
    source: `export type InlineObjectCompositionPatterns = Record<
  string,
  {
    isActivated: boolean;
    forbiddenProperty?: never;
    anotherForbiddenProperty?: never;
    description: string;
  }
> &
  Record<
    \`CORE_PROP_\${string}\`,
    {
      name: string;
      isActivated?: boolean;
      extendedOptions?: Record<string, unknown>;
    }
  > &
  Record<
    \`EXTENDED_PROP_\${string}\`,
    {
      corePropertyRef: string;
      isActivated?: boolean;
    }
  >;`,
  },
  {
    description: (
      <>
        <code>ApiRequest</code> is a standalone object declaration with no
        imported type dependencies. Its patterned strings become TypeScript
        template literal types for IDs and timestamps. Codegena prefers an
        {' '}<code>interface</code> for this shape.
      </>
    ),
    fileName: 'activity/api-request.ts',
    tooltipTitle: 'Interface with template literal IDs and timestamps',
    source: `/**
 * Represents a request that was made to the API. Including what Token was used
 * and what resource was accessed.
 */
export interface ApiRequest {
  /**
   * The unique id used to identify a single request.
   */
  requestId?: \`\${string}-\${string}-\${string}-\${string}-\${string}\`;
  /**
   * The time at which the request was processed by the server.
   */
  timestamp?: ${apiRequestTimestampType};
  action?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
  result?: 'SUCCESS' | 'DENY';
  actor?: {
    id?: \`\${string}-\${string}-\${string}-\${string}-\${string}\`;
    account?: string;
    jti?: string;
    userAgent?: string;
    requestIp?: string;
  };
  resource?: {
    type?: 'ITEM' | 'VAULT';
    vault?: {
      id?: string;
    };
    item?: {
      id?: string;
    };
    itemVersion?: number;
  };
}`,
  },
  {
    description: (
      <>
        <code>FirstLevel</code> through <code>SeventhLevel</code> reference one
        another, so Codegena groups them in <code>first-level.ts</code>.
        {' '}<code>ZeroLevel</code> and <code>EighthLevel</code> have no circular
        dependencies and remain in separate files. The relationships include
        both interface inheritance and property type references.
      </>
    ),
    fileName: 'first-level.ts',
    tooltipTitle: 'Recursive types grouped by circular references',
    source: `import type { ZeroLevel } from './zero-level';
import type { EighthLevel } from './eighth-level';

export interface FirstLevel extends ZeroLevel {
  id: string;
  children?: SecondLevel;
}

export interface SecondLevel {
  relatedItem?: FirstLevel | SecondLevel | ThirdLevel;
}

export interface ThirdLevel extends SecondLevel {
  relatedItem: FirstLevel | SecondLevel | ThirdLevel;
  anotherRelatedItem?: FirstLevel | SecondLevel | ThirdLevel | FourthLevel;
}

export interface FourthLevel extends ThirdLevel {
  anotherRelatedItem: FirstLevel | SecondLevel | ThirdLevel | FourthLevel;
  abstractProperty: Record<\`abstract-\${string}\`, unknown>;
  extendedRelatedItem?: FirstLevel | SecondLevel | ThirdLevel | FourthLevel | FifthLevel;
}

export interface FifthLevel {
  extendedRelatedItem?:
    FirstLevel | SecondLevel | ThirdLevel | FourthLevel | FifthLevel | SixthLevel;
}

export interface SixthLevel {
  extendedRelatedItem?: FirstLevel | SeventhLevel;
}

export interface SeventhLevel {
  extendedRelatedItem?:
    | FirstLevel
    | SecondLevel
    | ThirdLevel
    | FourthLevel
    | FifthLevel
    | SixthLevel
    | SeventhLevel
    | EighthLevel;
}`,
  },
  {
    description: (
      <>
        An array schema with <code>minItems: 2</code> becomes a tuple with two
        required <code>string</code> entries, followed by a rest element for
        any additional strings.
      </>
    ),
    fileName: 'array-min-scalar.ts',
    tooltipTitle: 'String array with at least two elements',
    source: 'export type ArrayMinScalar = [string, string, ...string[]];',
  },
] as const;
