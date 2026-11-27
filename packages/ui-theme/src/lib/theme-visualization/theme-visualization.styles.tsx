import Box, { type BoxProps } from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const themeVisualizationClasses = {
  header: 'ThemeVisualization__header',
  root: 'ThemeVisualization__root',
  sections: 'ThemeVisualization__sections',
};

/**
 * @internal
 */
export type ThemeVisualizationStylesProps = BoxProps;

export const ThemeVisualizationStyles = styled(Box)(({ theme }) => ({
  '&': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily,
    minHeight: '100%',
    padding: theme.spacing(3, 2),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4),
    },
  },
}));

export const ThemeVisualizationHeader = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  maxWidth: 1200,
}));

export const ThemeVisualizationTitle = styled(Typography)(({ theme }) => ({
  marginBottom: `${theme.spacing(4)} !important`,
}));

export const ThemeVisualizationIntro = styled(Typography)({
  maxWidth: 1200,
});

export const ThemeVisualizationSections = styled(Stack)({
  maxWidth: 1200,
});
