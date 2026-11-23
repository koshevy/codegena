import type {
  CompanionImplementation,
  CompanionImplementationModule,
} from '@codegena/pwa/common';

function isCompanionImplementationModule(
  value: unknown,
): value is CompanionImplementationModule {
  return typeof value === 'object'
    && value !== null
    && 'default' in value
    && typeof value.default === 'function';
}

export async function loadModuleImplementation(
  moduleUrl: string,
): Promise<CompanionImplementation> {
  const module: unknown = await import(
    /* @vite-ignore */ /* webpackIgnore: true */ moduleUrl
  );

  if (!isCompanionImplementationModule(module)) {
    throw new TypeError('The module must export a default function.');
  }

  return module.default;
}
