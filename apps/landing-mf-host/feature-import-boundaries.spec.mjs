import { ESLint } from 'eslint';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const eslint = new ESLint({ cwd: import.meta.dirname });
const rule = 'landing-mf-host/feature-import-boundaries';
const filePath = 'src/app/menu/overlay-navigation/import-boundary-probe.ts';

const cases = [
  ['rejects a private parent module', 'import "../overlay.styles";', true],
  ['rejects a private sibling module', 'import "../theme-choices/theme-choice";', true],
  ['rejects a private re-export', 'export * from "../theme-choices/theme-choice";', true],
  ['checks dynamic relative imports', 'import(`../overlay`);', true],
  ['checks interpolated sibling paths', `import(\`../theme-choices/\${name}\`);`, true],
  ['checks concatenated sibling paths', 'import("../theme-choices/" + name);', true],
  ['checks concatenated parent traversal', 'import("./" + "../overlay.styles");', true],
  ['checks type imports', 'type Overlay = typeof import("../overlay");', true],
  ['allows same-directory modules', 'import "./overlay-link.styles";', false],
  ['allows sibling feature entry points', 'import "../theme-choices";', false],
  ['allows explicit entry points', 'import "../../navigation/index.js";', false],
  ['allows a constant entry point', 'import("../" + "theme-choices");', false],
  ['allows computed paths in the current feature', `import(\`./\${name}\`);`, false],
  ['allows external federation imports', 'import("playground-mf-remote/App");', false],
];

cases.forEach(([name, source, isForbidden]) => {
  test(name, async () => {
    const [result] = await eslint.lintText(source, { filePath });
    const boundaryMessages = result.messages.filter(({ ruleId }) => ruleId === rule);

    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    assert.deepEqual(
      boundaryMessages.map(({ severity }) => severity),
      isForbidden ? [2] : [],
    );
  });
});
