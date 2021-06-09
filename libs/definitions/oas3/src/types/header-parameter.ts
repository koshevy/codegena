import {
    HasExample,
    HasRef,
} from '@codegena/definitions/aspects';

import { AbstractParameter } from './abstract-parameter';
import { ParameterStyle } from './parameter-style';

/**
 * Parameter in {@link https://swagger.io/specification/#headerObject}.
 */
export interface HeaderParameter extends HasRef, HasExample, AbstractParameter {
    /**
     * Describes how the parameter value will be serialized depending on the
     * type of the parameter value. Default values (based on value of `in`):
     *  - for `'query'` - `'form'`;
     *  - for `'path'` - `'simple'`;
     *  - for `'header'` - `'simple'`;
     *  - for `'cookie'` - `'form'`.
     *
     * @see https://swagger.io/docs/specification/serialization/
     * @see OApiParameter.explode
     *
     * TODO describe and support style in parameter. now is not. Important!
     * FIXME describe and support style in parameter. now is not. Important!
     */
    style?: ParameterStyle.Simple;
}
