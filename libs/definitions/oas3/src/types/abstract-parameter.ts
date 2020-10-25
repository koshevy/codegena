import { Schema } from '@codegena/definitions/json-schema';
import { ParameterStyle } from './parameter-style';

/**
 * Base ancestor for {@link OApiParameter} and {@link OApiHeaderParameter}.
 */
export interface AbstractParameter {
    /**
     * Determines whether the parameter value SHOULD allow reserved characters,
     * as defined by
     * {@link https://tools.ietf.org/html/rfc3986#section-2.2 | RFC3986}
     * `:/?#[]@!$&'()*+,;=` to be included without percent-encoding.
     * This property only applies to parameters with an `in` value of `query`.
     *
     * The default value is `false`.
     *
     * TODO describe and support allowReserved in parameter. now is not
     */
    allowReserved: boolean;

    /**
     * Sets the ability to pass empty-valued parameters. This is valid only for
     * `query` parameters and allows sending a parameter with an empty value.
     * Default value is `false`.
     * If {@link https://swagger.io/specification/#parameterStyle | style}
     * is used, and if behavior is n/a (cannot be serialized), the value of
     * `allowEmptyValue` SHALL be ignored.
     *
     * @deprecated
     * Use of this property is NOT RECOMMENDED,
     * as it is likely to be removed in a later revision.
     */
    allowEmptyValue?: boolean;

    /**
     * A brief description of the parameter. This could contain examples of use.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * Specifies that a parameter is deprecated and SHOULD be transitioned out
     * of usage. Default value is false.
     *
     * TODO describe and support deprecated in parameter. now is not
     */
    deprecated?: boolean;

    /**
     * When this is true, parameter values of type `array` or `object` generate separate parameters
     * for each value of the array or key-value pair of the map. For other types of parameters this
     * property has no effect. When `style` is form, the default value is `true`. For all other
     * styles, the default value is `false`.
     *
     * @see https://swagger.io/docs/specification/serialization/
     * @see Parameter.style
     *
     * TODO describe and support explode in parameter. now is not. Important!
     * FIXME describe and support explode in parameter. now is not. Important!
     */
    explode?: boolean;

    /**
     * Determines whether this parameter is mandatory. If the `in`
     * is "path", this property is REQUIRED and its value MUST be true.
     * Otherwise, the property MAY be included and its default value is false.
     */
    required: boolean;

    /**
     * The schema defining the type used for the parameter.
     */
    schema?: Schema;

    /**
     * Describes how the parameter value will be serialized depending on the
     * type of the parameter value. Default values (based on value of `in`):
     *  - for `'query'` - `'form'`;
     *  - for `'path'` - `'simple'`;
     *  - for `'header'` - `'simple'`;
     *  - for `'cookie'` - `'form'`.
     *
     * @see https://swagger.io/docs/specification/serialization/
     * @see Parameter.explode
     *
     * TODO describe and support style in parameter. now is not. Important!
     * FIXME describe and support style in parameter. now is not. Important!
     */
    style?: ParameterStyle;
}
