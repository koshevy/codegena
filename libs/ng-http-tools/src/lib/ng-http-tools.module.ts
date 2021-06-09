import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    }): ModuleWithProviders<NgHttpToolsModule> {
        return {
            ngModule: NgHttpToolsModule,
            providers: [
                {
                    provide: AjvWrapperService,
                    useFactory: () => new AjvWrapperService(
                        options.shouldThrowOnFails ?? true,
                        options.formats ?? {},
                        options.unknownFormats ?? [],
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
