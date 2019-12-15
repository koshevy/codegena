import _ from 'lodash';
import { ApiServiceTemplateData } from './api-service.data';
import { template as template_ } from './api-service.template';
import * as prettier from 'prettier/standalone';
import * as prettierParserTS from 'prettier/parser-typescript';

const prettierOptions = {
    bracketSpacing: true,
    parser: 'typescript',
    plugins: [prettierParserTS],
    singleQuote: true
};

// TODO should be cuted in production
export * from './api-service.data';
export const createApiServiceWithTemplate: (data: ApiServiceTemplateData)
    => string = (data) => {
        _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
        const template = _.template(template_);

        return prettier.format(template(data), prettierOptions) as string;
    };
