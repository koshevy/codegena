import { Oas3Server } from '@codegena/definitions/oas3';
import { createUrl } from './create-url';

describe('createUrl function', () => {
    it('should create url without server or path params', () => {
        const pathTemplate = '/relative/path'
        const servers: Oas3Server[] = [{ url: 'http://example.com' }];
        const url = createUrl({ servers, pathTemplate });

        expect(url).toBe('http://example.com/relative/path');
    });

    it('should create url with default server params', () => {
        const pathTemplate = '/relative/path'
        const servers: Oas3Server[] = [
            {
                url: 'http://{env}.example.com',
                variables: {
                    env: { default: 'test' },
                },
            }
        ];
        const url = createUrl({ servers, pathTemplate });

        expect(url).toBe('http://test.example.com/relative/path');
    });

    it('should use server appropriate to params', () => {
        const pathTemplate = '/relative/path'
        const servers: Oas3Server[] = [
            {
                url: 'http://{env}.example.com',
                variables: {
                    env: { default: 'test' },
                },
            },
            {
                url: 'http://{user}.{env}.example.com',
                variables: {
                    env: { default: 'test' },
                    user: { default: 'anonymous' }
                },
            },
        ];
        const url = createUrl({
            servers,
            pathTemplate,
            serverParams: {
                user: 'cheburashka',
            },
        });

        expect(url).toBe('http://cheburashka.test.example.com/relative/path');
    });

    it('should ignore wrong value of server\'s variable with enum', () => {
        const pathTemplate = '/relative/path'
        const servers: Oas3Server[] = [
            {
                url: 'http://{env}.example.com',
                variables: {
                    env: { default: 'test' },
                },
            },
            {
                url: 'http://{user}.{env}.example.com',
                variables: {
                    env: {
                        default: 'test',
                        enum: ['local', 'test', 'production'],
                    },
                    user: { default: 'anonymous' }
                },
            },
        ];

        expect(() => createUrl({
            servers,
            pathTemplate,
            serverParams: {
                user: 'cheburashka',
                env: 'preproduction',
            },
        })).toThrowError(/No one server/);
    });

    it('should chose server\'s by environment', () => {
        const pathTemplate = '/relative/path'
        const servers: Oas3Server[] = [
            {
                environment: 'production',
                url: 'http://prod.example.com',
            },
            {
                environment: 'test',
                url: 'http://test.example.com',
            },
            {
                environment: 'development',
                url: 'http://dev.example.com',
            },
        ];
        const url = createUrl({
            servers,
            pathTemplate,
            environment: 'test',
        });

        expect(url).toBe('http://test.example.com/relative/path');
    });

    it('should use server path with URI part', () => {
        const pathTemplate = '/relative/path'
        const servers: Oas3Server[] = [
            { url: 'http://prod.example.com/base/' },
        ];
        const url = createUrl({ servers, pathTemplate });

        expect(url).toBe('http://prod.example.com/base/relative/path');
    });

    it('should bind path template params', () => {
        const pathTemplate = '/get-goods-category/{goodsCategory}'
        const servers: Oas3Server[] = [{ url: 'http://example.com' }];
        const url = createUrl({
            servers,
            pathTemplate,
            pathParams: {
                goodsCategory: 'teapots',
            }
        });

        expect(url).toBe('http://example.com/get-goods-category/teapots');
    });
});
