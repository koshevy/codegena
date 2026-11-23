import {
  createConditionalIfThenElseDeclaration,
} from './create-conditional-if-then-else-declaration';
import {
  createDefaultIfThenElseDeclaration,
} from './create-default-if-then-else-declaration';
import type { VisitorIfProps } from './visitor-if-props';
import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';

export const visitorIf: TypescriptParserVisitorFn = (props) => {
  const { transitiveNode } = props;

  if (transitiveNode.type !== 'conditional') {
    return null;
  }

  const visitorIfProps: VisitorIfProps = {
    ...props,
    transitiveNode,
  };

  if (visitorIfProps.options?.useConditionalIfThenElseDeclaration === true) {
    return createConditionalIfThenElseDeclaration(visitorIfProps);
  }

  return createDefaultIfThenElseDeclaration(visitorIfProps);
};
