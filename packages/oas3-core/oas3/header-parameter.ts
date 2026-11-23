import { AbstractParameter } from './abstract-parameter';

/**
 * Parameter in {@link https://swagger.io/specification/#headerObject}.
 */
export interface HeaderParameter extends Omit<
  AbstractParameter,
  'allowEmptyValue' | 'allowReserved' | 'style'
> {
  /**
   * Header names come from the containing map, not the object.
   */
  name?: never;

  /**
   * Header location is implicit.
   */
  in?: never;

  style?: 'simple';
}
