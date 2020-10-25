import { Schema } from '@codegena/definitions/json-schema';
import { Headers } from './headers';
import { Parameter } from './parameter';
import { Request } from './request';
import { Response } from './response';

/**
 * Holds a set of reusable objects for different aspects of the OAS. All objects
 * defined within the schema object will have no effect on the API unless
 * they are explicitly referenced from properties outside the schema object.
 *
 * @see https://swagger.io/specification/#componentsObject
 */
export interface ReusableComponents {
    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#callbackObject | Callback Objects}.
     *
     * TODO describe and support component callbacks. now is not
     */
    callbacks: {
        [callbacksObjectName: string]: any;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#exampleObject | Example Objects}.
     * TODO describe and support component examples. now is not
     */
    examples: {
        [exampleObjectName: string]: any;
    };

    /**
     * An object to hold reusable
     * {https://swagger.io/specification/#headerObject | Header Objects}.
     */
    headers: Headers;

    /**
     * An object to hold reusable
     * {https://swagger.io/specification/#linkObject | Link Objects}.
     * TODO describe and support component links. now is not
     */
    links: {
        [key: string]: any;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#parameterObject | Parameter Objects }.
     */
    parameters: {
        [paramterObjectName: string]: Parameter;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#requestBodyObject | Request Body Objects }.
     */
    requestBodies: {
        [requestObjectName: string]: Request;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#responseObject | Response Objects}.
     */
    responses: {
        [responseObjectName: string]: Response;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#securitySchemeObject | Security Scheme Objects}.
     * TODO describe and support component security schemes. now is not
     */
    securitySchemes: {
        [key: string]: any;
    };

    /**
     * An object to hold reusable Schema Objects.
     */
    schemas: {
        [schemaObjectName: string]: Schema;
    };
}
