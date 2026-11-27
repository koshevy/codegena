import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactElement, ReactNode } from 'react';

import {
  panelHeaderContentClasses,
  PanelHeaderContentStyles,
} from './panel-header-content.styles';
import { usePanelHeaderOverflow } from './use-panel-header-overflow';

interface PanelHeaderContentProps {
  afterTitle?: ReactNode;
  hideHeading: boolean;
  icon?: ReactNode;
  title: string;
}

export function PanelHeaderContent({
  afterTitle,
  hideHeading,
  icon,
  title,
}: PanelHeaderContentProps): ReactElement {
  const {
    clippedEdges,
    contentRef,
    scrollRef,
    updateClippedEdges,
  } = usePanelHeaderOverflow();

  const isContentClipped = clippedEdges.start || clippedEdges.end;
  const contentTabIndex = isContentClipped ? 0 : undefined;

  const hasToShowHeading = !hideHeading;
  const hasToShowIcon = hasToShowHeading && !!icon;
  const hasToShowAfterTitle = !!afterTitle;

  const renderedIcon = hasToShowIcon && (
    <Box className={panelHeaderContentClasses.icon}>
      {icon}
    </Box>
  );

  const renderedHeading = hasToShowHeading && (
    <>
      {renderedIcon}
      <Typography
        className={panelHeaderContentClasses.title}
        fontWeight={400}
        variant="body1"
      >
        {title}
      </Typography>
    </>
  );

  const renderedAfterTitle = hasToShowAfterTitle && (
    <Box className={panelHeaderContentClasses.afterTitle}>
      {afterTitle}
    </Box>
  );

  return (
    <PanelHeaderContentStyles
      className={panelHeaderContentClasses.scrollRegion}
      data-clipped-end={clippedEdges.end}
      data-clipped-start={clippedEdges.start}
    >
      <Box
        className={panelHeaderContentClasses.content}
        onScroll={updateClippedEdges}
        ref={scrollRef}
        tabIndex={contentTabIndex}
      >
        <Box
          className={panelHeaderContentClasses.contentInner}
          ref={contentRef}
        >
          {renderedHeading}
          {renderedAfterTitle}
        </Box>
      </Box>
    </PanelHeaderContentStyles>
  );
}
