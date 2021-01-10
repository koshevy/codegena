import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
    AjvWrapperService,
} from './entrypoint-abstract/validation/ajv-wrapper.service';
import {
    EntrypointValidationService,
} from './entrypoint-abstract/validation/entrypoint-validation.service';
import {
    SERVER_ENVIRONMENT,
} from './entrypoint-abstract/server-environment';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
    ],
})
export class NgHttpToolsModule {
    public static forModule(options: {
        shouldThrowOnFails: boolean,
        formats: Record<string, any>,
        unknownFormats: string[],
    }): ModuleWithProviders<NgHttpToolsModule> {
        return {
            ngModule: NgHttpToolsModule,
            providers: [
                {
                    provide: AjvWrapperService,
                    useFactory: () => new AjvWrapperService(
                        options.shouldThrowOnFails || true,
                        options.formats || {},
                        options.unknownFormats || [],
                    ),
                },
                {
                    provide: SERVER_ENVIRONMENT,
                    useValue: {},
                },
                EntrypointValidationService,
            ],
        }
    }
}
