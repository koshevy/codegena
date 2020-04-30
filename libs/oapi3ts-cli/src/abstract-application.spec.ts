import { AbstractApplication } from './abstract-application';
import { CliConfig, defaultCliConfig } from './cli-config';
import { OApiStructure } from '@codegena/oapi3ts';
import { ObjectTypeScriptDescriptor } from "@codegena/oapi3ts/lib/adapters/typescript/descriptors/object";

export class TestApplication extends AbstractApplication {

    public savedFilesContent: object = {};

    protected get destPathAbs(): string {
        return null;
    }

    protected getCliConfig(): CliConfig {
        return {
            ...defaultCliConfig,
            srcPath: '01-spec-with-self-ref.json'
        };
    }

    protected getOApiStructure(): OApiStructure {
        return require('./mocks/oas3/01-spec-with-self-ref.json');
    }

    protected saveFile(
        fileName: string,
        subdir: string,
        fileContents: string
    ): void {
        this.savedFilesContent[fileName] = fileContents;
    }
}

describe('Abstract application test', () => {
    it('should correct render "import"-statements in files with circular typings', () => {
        const testApp = new TestApplication();
        testApp.createTypings();

        expect(testApp.savedFilesContent['circular-ref']).toContain(
            'import { NonCircularRef } from \'./non-circular-ref\';'
        );

        expect(testApp.savedFilesContent['circular-ref']).not.toContain(
            'import { CircularRef } from \'./circular-ref\';'
        );
    });
});
