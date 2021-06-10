import { inject, NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Options as AjvOptions } from 'ajv';
import {
    VALIDATION_ERROR_STREAM,
} from './entrypoint-abstract/validation/validation-error-stream';
import {
    AjvWrapperService,
} from './entrypoint-abstract/validation/ajv-wrapper.service';
import {
    EntrypointValidationService,
} from './entrypoint-abstract/validation/entrypoint-validation.service';
import {
    SERVER_ENVIRONMENT,
    ServerEnvironment,
} from './entrypoint-abstract/server-environment';

@NgModule({
    imports: [
        CommonModule,
    ],
})
export class NgHttpToolsModule {
    public static forModule(options: {
        shouldThrowOnFails?: boolean,
        formats?: Record<string, any>,
        unknownFormats?: string[],
        serverEnvironment?: ServerEnvironment,
        ajvOptions?: AjvOptions,
    }): ModuleWithProviders<NgHttpToolsModule> {
        return {
            ngModule: NgHttpToolsModule,
            providers: [
                {
                    provide: AjvWrapperService,
                    useFactory: () => new AjvWrapperService(
                        inject(VALIDATION_ERROR_STREAM),
                        options.shouldThrowOnFails ?? true,
                        options.formats ?? {},
                        options.unknownFormats ?? [],
                        options.ajvOptions ?? {},
                    ),
                },
                {
                    provide: SERVER_ENVIRONMENT,
                    useValue: options.serverEnvironment ?? {},
                },
                EntrypointValidationService,
            ],
        };
    }
}
