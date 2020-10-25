import { HasRef, HasExample } from '@codegena/definitions/aspects';
import { AbstractParameter } from './abstract-parameter';
import { ParameterTarget } from './parameter-target';

/**
 * Describes a single operation parameter.
 * A unique parameter is defined by a combination of a
 * {@link https://swagger.io/specification/#parameterName | name}
 * and
 * {@link https://swagger.io/specification/#parameterIn | location}.
 *
 * @see https://swagger.io/specification/#parameterObject
 * @see https://swagger.io/docs/specification/describing-parameters/
 */
export interface Parameter extends HasRef, HasExample, AbstractParameter {

    /**
     * REQUIRED. The location of the parameter. Possible values are:
     * - "query",
     * - "header"
     * - "path"
     * - "cookie"
     */
    in: ParameterTarget;

    /**
     * REQUIRED. The name of the parameter. Parameter names are case sensitive.
     *
     * @see https://swagger.io/specification/#parameterObject
     */
    name: string;

    /**
     * @deprecated
     * Not in {@link https://swagger.io/specification/#parameterObject | Open API specification }.
     * Makes extracted schema of params supporting `readonly` params.
     */
    readOnly?: boolean;
}
