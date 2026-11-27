export const codeExample = `
import type { Patch as __Patch } from './patch';
import type { FullItem as __FullItem } from '../_common/full-item';
import type { Item as __Item } from '../_common/item';
import type { Field as __Field } from '../_common/field';
import type { GeneratorRecipe as __GeneratorRecipe } from '../_common/generator-recipe';
import type { File as __File } from '../../_common/file';
import type { ErrorResponse as __ErrorResponse } from '../../_common/error-response';
import type {
  PathParametersItemsUpdateSubsetAttributes,
} from './path-parameters-items-update-subset-attributes';
import type {
  RequestItemsUpdateSubsetAttributes,
} from './request-items-update-subset-attributes';
import type {
  ResponseItemsUpdateSubsetAttributes,
} from './response-items-update-subset-attributes';

/**
 * ## Update a subset of Item attributes
 *
 * Applies a modified [RFC6902 JSON Patch](https://tools.ietf.org/html/rfc6902)
 * document to an Item or ItemField. This endpoint only supports \`add\`, \`remove\`
 * and \`replace\` operations.
 *
 * When modifying a specific ItemField, the ItemField's ID in the \`path\`
 * attribute of the operation object: \`/fields/{fieldId}\`
 *
 * #### Original info
 *
 * - Path: \`/vaults/{vaultUuid}/items/{itemUuid}\`
 * - Method: \`PATCH\`
 * - Operation ID: \`Items_updateSubsetAttributes\`
 * - Tags: \`Items\`
 */
export namespace ItemsUpdateSubsetAttributes {
  export type PathParameters = PathParametersItemsUpdateSubsetAttributes;
  export type Request<TContentType extends 'application/json' = 'application/json'> =
    RequestItemsUpdateSubsetAttributes<TContentType>;
  export type Response<
    TCode extends 200 | 401 | 403 | 404 = 200 | 401 | 403 | 404,
    TContentType extends 'application/json' = 'application/json',
  > = ResponseItemsUpdateSubsetAttributes<TCode, TContentType>;
  /**
   * Flat list of all utility data types used by this OpenAPI declaration and
   * defined in the specification.
   */
  export namespace Lib {
    export type Patch = __Patch;
    export type FullItem = __FullItem;
    export type Item = __Item;
    export type Field = __Field;
    /**
     * The recipe is used in conjunction with the "generate" property to set
     * the character set used to generate a new secure value
     */
    export type GeneratorRecipe = __GeneratorRecipe;
    export type File = __File;
    export type ErrorResponse = __ErrorResponse;
  }
}

export type { ItemsUpdateSubsetAttributes as default };`.trimStart();
