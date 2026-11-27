import type {
  AbstractTransitiveNodeAnnotations,
  TransitiveNode,
} from '../../transitive-node';
import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorSchemaAnnotationOptions = UnknownOptions;

const defaultOptions: SchemaConvertorSchemaAnnotationOptions = {};

const stringAnnotations = [
  ['$comment', 'comment'],
  ['description', 'description'],
  ['title', 'title'],
] as const;

const booleanAnnotations = [
  ['deprecated', 'deprecated'],
  ['readOnly', 'readOnly'],
  ['writeOnly', 'writeOnly'],
] as const;

export class SchemaConvertorSchemaAnnotation extends SchemaConvertorAbstract<
  SchemaConvertorSchemaAnnotationOptions
> {
  convert(): TransitiveNode | null {
    const schema = this.jsoncTree.getData(this.path);

    if (!isSchemaRecord(schema)) {
      return null;
    }

    const annotationsByName = this.extractAnnotations(schema);

    if (annotationsByName.size === 0) {
      return null;
    }

    const annotations = Object.fromEntries(annotationsByName);

    const transitiveNode = this.processNestedSchema({
      absPath: this.path,
      extendedPart: { isExcludedFromResult: true },
      skipCaching: true,
      skipConvertors: [
        ...this.props.skipConvertors ?? [],
        SchemaConvertorSchemaAnnotation,
      ],
    });

    if (!transitiveNode) {
      this.logger.warn(
        { node: this.source.node },
        'Schema annotations were attached to an unknown transitive node.',
      );

      return {
        annotations,
        source: this.source,
        type: 'unknown',
      };
    }

    delete transitiveNode.isExcludedFromResult;
    transitiveNode.annotations = {
      ...transitiveNode.annotations,
      ...annotations,
    };

    return transitiveNode;
  }

  getDefaultOptions(): SchemaConvertorSchemaAnnotationOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private extractAnnotations(
    schema: Record<string, unknown>,
  ): Map<keyof AbstractTransitiveNodeAnnotations, unknown> {
    const annotations = new Map<keyof AbstractTransitiveNodeAnnotations, unknown>();
    const summary = schema['summary'];

    for (const [schemaKey, annotationKey] of stringAnnotations) {
      const value = schema[schemaKey];

      if (typeof value === 'string') {
        annotations.set(annotationKey, value);
      }
      else if (value !== undefined) {
        this.warnInvalidAnnotation(schemaKey);
      }
    }

    if (typeof summary === 'string') {
      annotations.set('title', summary);
    }
    else if (summary !== undefined) {
      this.warnInvalidAnnotation('summary');
    }

    for (const [schemaKey, annotationKey] of booleanAnnotations) {
      const value = schema[schemaKey];

      if (typeof value === 'boolean') {
        annotations.set(annotationKey, value);
      }
      else if (value !== undefined) {
        this.warnInvalidAnnotation(schemaKey);
      }
    }

    if (Object.hasOwn(schema, 'default')) {
      annotations.set('default', schema['default']);
    }

    if (Array.isArray(schema['examples'])) {
      annotations.set('examples', schema['examples']);
    }
    else if (schema['examples'] !== undefined) {
      this.warnInvalidAnnotation('examples');
    }

    return annotations;
  }

  private warnInvalidAnnotation(schemaKey: string): void {
    this.logger.warn(
      { node: this.source.node },
      `Ignored invalid schema annotation "${schemaKey}".`,
    );
  }
}

function isSchemaRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
