import {
  conversionWorkerInputSchema,
  type ConversionWorkerResult,
} from '../conversion-channel';

export async function convertWorkerInput(
  value: unknown,
): Promise<ConversionWorkerResult> {
  try {
    const [{ mapGraphPayloadToWorkerPayload }, { convertSourceToGraph }] = (
      await Promise.all([
        import(/* webpackChunkName: "specification-converter" */ '@codegena/graph-core'),
        import(
          /* webpackChunkName: "specification-converter" */
          '@codegena/graph-core/conversion'
        ),
      ])
    );

    const input = conversionWorkerInputSchema.parse(value);
    const graph = await convertSourceToGraph(input);
    const serializableGraph = mapGraphPayloadToWorkerPayload(graph);

    return { serializedGraph: JSON.stringify(serializableGraph) };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Conversion failed.';

    return { error: message };
  }
}
