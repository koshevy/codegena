import { AbstractApplication } from './abstract-application';
import { CliConfig, defaultCliConfig } from './cli-config';
import { OApiStructure } from '@codegena/oapi3ts';

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
    let testApp: TestApplication;

    beforeAll(async () => {
        testApp = new TestApplication();
        testApp.createTypings();
    });

    it.each([
        'simplest-get-01-parameters',
        'non-circular-ref',
        'circular-ref',
        'simplest-get-01-response',
        'index'
    ])('should output file "%s"', (fileName) => {
        expect(testApp.savedFilesContent).toHaveProperty(fileName);
    });

    it.each([
        'simplest-get-01-parameters',
        'non-circular-ref',
        'circular-ref',
        'simplest-get-01-response'
    ])('should add export of "%s" in index', (fileName) => {
        expect(testApp.savedFilesContent['index'])
            .toContain(`export * from './${fileName}'`);
    });


    it.each([
        'simplest-get-01-parameters',
        'non-circular-ref',
    ])('should not to add import in "%s"', (fileName) => {
        expect(testApp.savedFilesContent[fileName]).not.toContain(
            'import {'
        );
    });

    it('should add import `CircularRef` in `simplest-get-01-response`', () => {
        expect(testApp.savedFilesContent['simplest-get-01-response']).toContain(
            'import { CircularRef } from \'./circular-ref\''
        );
    });

    it('should add import of `NonCircularRef` in `circular-ref`', () => {
        expect(testApp.savedFilesContent['circular-ref']).toContain(
            'import { NonCircularRef } from \'./non-circular-ref\';'
        );
    });

    it('should not to add import of `CircularRef` in `circular-ref`', () => {
        expect(testApp.savedFilesContent['circular-ref']).not.toContain(
            'import { CircularRef } from \'./circular-ref\';'
        );
    });
});
