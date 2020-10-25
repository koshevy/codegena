/**
 * Style of parameter serialization.
 * @see https://swagger.io/docs/specification/serialization/
 */
export enum ParameterStyle {
    Simple = 'simple',
    Label = 'label',
    Matrix = 'matrix',
    Form = 'form',
    SpaceDelimited = 'spaceDelimited',
    PipeDelimited = 'pipeDelimited',
    DeepObject = 'deepObject'
}
