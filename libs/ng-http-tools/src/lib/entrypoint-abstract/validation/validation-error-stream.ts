import { EventEmitter, InjectionToken } from '@angular/core';
import { ValidationError } from './validation-error';

export const VALIDATION_ERROR_STREAM = new InjectionToken<
    EventEmitter<ValidationError> | null
>(
    'Validation error stream',
    {
        factory: () => null,
    },
);
