import { pick, template } from 'lodash';

const interpolate = /{([\s\S]+?)}/g;

export function createUrl(
    pathTemplate: string,
    parameters: object,
): string {
    const compliedTemplate = template(pathTemplate, {interpolate});

    return compliedTemplate(parameters);
}
