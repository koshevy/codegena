import { pick, template, trim } from 'lodash';

const interpolate = /{([\s\S]+?)}/g;

export function createUrl(
    servers: string[],
    pathTemplate: string,
    parameters: object,
): string {
    const compliedTemplate = template(pathTemplate, {interpolate});
    const uri = compliedTemplate(parameters);

    return [
        trim(servers?.[0] || 'http://localhost', '/'),
        uri,
    ].join('');
}
