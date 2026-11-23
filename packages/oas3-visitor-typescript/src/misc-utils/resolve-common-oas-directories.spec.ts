import { resolveCommonOasDirectories } from './resolve-common-oas-directories';

describe('resolveCommonOasDirectories', () => {
  it('uses the first available common name at each parent', () => {
    const directoriesByGroup = new Map([
      ['firstOperation', 'actions/_common'],
      ['secondOperation', 'actions/_common1'],
      ['thirdOperation', 'actions/delete'],
      ['sharedArtifact', 'actions'],
      ['sharedResponse', 'actions'],
      ['rootShared', ''],
    ]);

    const commonGroups = new Set([
      'sharedArtifact',
      'sharedResponse',
      'rootShared',
    ]);

    expect(resolveCommonOasDirectories(
      directoriesByGroup,
      commonGroups,
    )).toEqual(new Map([
      ['firstOperation', 'actions/_common'],
      ['secondOperation', 'actions/_common1'],
      ['thirdOperation', 'actions/delete'],
      ['sharedArtifact', 'actions/_common2'],
      ['sharedResponse', 'actions/_common2'],
      ['rootShared', '_common'],
    ]));
  });
});
