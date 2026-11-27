import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ReactElement, ReactNode } from 'react';

export const sectionCardClasses = {
  body: 'SectionCard__body',
  header: 'SectionCard__header',
  root: 'SectionCard__root',
};

export interface SectionCardProps {
  accentColor: string;
  children: ReactNode;
  subtitle: string;
  title: string;
}

const SectionCardStyles = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: `${theme.shape.borderRadius}px`,
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
}));

const SectionCardHeaderStyles = styled(Box, {
  shouldForwardProp: (propName) => propName !== 'accentColor',
})<{ accentColor: string }>(({ accentColor, theme }) => ({
  background: [
    `linear-gradient(135deg, ${accentColor}18 0%`,
    `${theme.palette.background.paper} 72%)`,
  ].join(', '),
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2.5, 3),
}));

const SectionCardBodyStyles = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const SectionCardSubtitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));

/**
 * @internal
 */
export function SectionCard({
  accentColor,
  children,
  subtitle,
  title,
}: SectionCardProps): ReactElement {
  return (
    <SectionCardStyles className={sectionCardClasses.root}>
      <SectionCardHeaderStyles
        accentColor={accentColor}
        className={sectionCardClasses.header}
      >
        <Typography variant="h6">{title}</Typography>
        <SectionCardSubtitle
          color="text.secondary"
          variant="body2"
        >
          {subtitle}
        </SectionCardSubtitle>
      </SectionCardHeaderStyles>
      <SectionCardBodyStyles className={sectionCardClasses.body}>
        {children}
      </SectionCardBodyStyles>
    </SectionCardStyles>
  );
}
