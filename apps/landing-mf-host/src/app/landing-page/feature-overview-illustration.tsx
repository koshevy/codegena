import { GeneratedCodeEditor } from '@codegena/ui-unified/code-editor-minimal';
import { FileDetailsHeader } from '@codegena/ui-unified/files';
import Button from '@mui/material/Button';
import { Braces, Folder, Search, SquareTerminal } from 'lucide-react';
import { motionValue } from 'motion/react';
import { stripVTControlCharacters } from 'node:util';
import type { ReactElement, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { cliTerminalExample } from './cli/cli-terminal-example';
import { SearchIllustrationStyles } from './data-engine/search-illustration.styles';
import {
  featureIllustrationClasses,
  FeatureIllustrationStyles,
} from './feature-illustration.styles';
import { FeatureOverviewExamples } from './feature-overview-examples';
import { featureOverviewClasses } from './feature-overview.styles';
import { onePasswordGeneratedFileTree } from './foldering/illustration.graph';
import { IdeIllustration } from './ide-plugins';
import { codeExamples } from './json-schema/code-carousel.examples';
import { Orbit } from './orbit';
import { demoChoices, getPlaygroundPath } from '../playground-examples';

const orbitAngle = motionValue(0);
const illustrationKinds = ['code', 'terminal', 'foldering', 'search', 'ide', 'unified'];
const exampleFolders = onePasswordGeneratedFileTree.nodes.filter(({ data, parentId }) => (
  parentId === '.' && 'kind' in data && data.kind === 'directory'
));

function renderPanel(
  name: string,
  renderedIcon: ReactElement,
  renderedBody: ReactNode,
  isCode = false,
): ReactElement {
  return (
    <div
      className={featureOverviewClasses.panel}
      data-code={isCode}
    >
      <FileDetailsHeader
        icon={renderedIcon}
        name={name}
      />
      <div className={featureOverviewClasses.body}>{renderedBody}</div>
    </div>
  );
}

function renderPreview(activeStep: number, search: string): ReactElement {
  if (activeStep === 0) {
    const example = codeExamples[0];
    const ariaLabel = `Generated TypeScript preview for ${example.fileName}`;
    const renderedCode = (
      <GeneratedCodeEditor
        ariaLabel={ariaLabel}
        height="var(--landing-code-editor-height)"
        value={example.source}
      />
    );
    const renderedIcon = <Braces aria-hidden />;

    return renderPanel(example.fileName, renderedIcon, renderedCode, true);
  }

  if (activeStep === 1) {
    const { command, greeting, outputs, prompt } = cliTerminalExample;
    const transcript = stripVTControlCharacters(
      [`${prompt} ${command}`, greeting, ...outputs].join('\n\n'),
    );
    const renderedTerminal = <pre>{transcript}</pre>;

    return renderPanel(
      'codegena — terminal',
      <SquareTerminal aria-hidden />,
      renderedTerminal,
    );
  }

  if (activeStep === 2) {
    const renderedFolders = exampleFolders.map(({ id }) => (
      <li key={id}>
        <Folder aria-hidden />
        <code>{id}</code>
      </li>
    ));

    const renderedTree = (
      <ul className={featureOverviewClasses.files}>{renderedFolders}</ul>
    );

    return renderPanel(
      'oas3-onepassword-connect.json',
      <Folder aria-hidden />,
      renderedTree,
    );
  }

  if (activeStep === 3) {
    const githubExample = demoChoices.find(({ specUrl }) => (
      specUrl === '/specifications/github.json'
    ));
    const href = githubExample ? getPlaygroundPath(githubExample.specUrl) : '/playground';

    return (
      <SearchIllustrationStyles>
        <Orbit
          angle={orbitAngle}
          phrase="Click to try out the search"
          repetitions={4}
        />
        <Button
          href={`${href}${search}`}
          startIcon={<Search aria-hidden />}
          variant="contained"
        >
          Try searching GitHub’s API
        </Button>
      </SearchIllustrationStyles>
    );
  }

  if (activeStep === 4) {
    return <IdeIllustration orbitAngle={orbitAngle} />;
  }

  return <FeatureOverviewExamples search={search} />;
}

export function FeatureOverviewIllustration({
  activeStep,
}: { activeStep: number }): ReactElement {
  const { search } = useLocation();
  const renderedIllustration = renderPreview(activeStep, search);

  return (
    <FeatureIllustrationStyles data-illustration={illustrationKinds[activeStep]}>
      <div className={featureIllustrationClasses.scene}>{renderedIllustration}</div>
    </FeatureIllustrationStyles>
  );
}
