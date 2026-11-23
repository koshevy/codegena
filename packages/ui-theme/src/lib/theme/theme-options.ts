import { ThemeOptions } from '@mui/material/styles';
import {
  alpha,
  blend,
  darken,
  lighten,
} from '@mui/system/colorManipulator';

export const defaultThemeOptions: ThemeOptions = {
  spacing: 4,
  shape: {
    borderRadius: 6,
  },
  shadows: [
    'none',
    ...Array.from({ length: 25 }, (_, index) => (
      `${index / 2}px ${index / 2}px ${index * 2}px 0px rgba(0,0,0,0.15);`
    )),
  ] as ThemeOptions['shadows'],
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiAlert-filled.MuiAlert-colorError': {
            background: theme.palette.error.dark,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
        sizeMedium: {
          fontSize: '1rem',
        },
        sizeLarge: {
          fontSize: '1.2rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          gap: theme.spacing(1),
          padding: `.1rem .3rem`,
          borderRadius: '.4rem',
        }),
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-error': {
            color: theme.palette.error.dark,
          },
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiInputBase-colorInfo': {
            'background': theme.palette.background.default,
            'fieldset': {
              borderColor: theme.palette.divider,
            },
            '&.Mui-error fieldset': {
              border: `solid ${theme.palette.divider} 1px !important`,
            },
            '&:hover fieldset': {
              border: `solid ${darken(theme.palette.divider, 0.3)} 1px !important`,
            },
            '&.Mui-error:hover fieldset': {
              border: `solid ${theme.palette.error.dark} 1px !important`,
            },
            '&.Mui-focused fieldset': {
              border: `solid ${theme.palette.focus.main} 1.5px !important`,
            },
            '&.Mui-focused.Mui-error fieldset': {
              border: `solid ${theme.palette.error.dark} 1.5px !important`,
            },
          },
        }),
        colorSecondary: ({ theme }) => ({
          'background': theme.palette.background.default,
          'fieldset': {
            borderColor: theme.palette.divider,
          },
          '&.Mui-error fieldset': {
            border: `solid ${theme.palette.divider} 1px !important`,
          },
          '&:hover fieldset': {
            border: `solid ${darken(theme.palette.divider, 0.3)} 1px !important`,
          },
          '&.Mui-error:hover fieldset': {
            border: `solid ${theme.palette.error.dark} 1px !important`,
          },
          '&.Mui-focused fieldset': {
            border: `solid ${theme.palette.divider} 1.5px !important`,
          },
          '&.Mui-focused.Mui-error fieldset': {
            border: `solid ${theme.palette.error.dark} 1.5px !important`,
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
          textDecorationColor: alpha(theme.palette.primary.main, 0.4),
        }),
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-selected': {
            background: blend(
              theme.palette.text.secondary,
              theme.palette.primary.main,
              0.5,
            ),
            color: theme.palette.primary.contrastText,
          },
          '&:hover': {
            // intricate way to keep it contrast for light and dark themes
            background: alpha(
              lighten(theme.palette.primary.light, 0.6),
              0.6,
            ),
          },
          '&.Mui-selected:hover': {
            background: blend(
              theme.palette.text.secondary,
              theme.palette.primary.main,
              0.7,
            ),
            color: theme.palette.primary.contrastText,
          },
        }),
      },
    },
    MuiTooltip: {
      defaultProps: {
        placement: 'top',
      },
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backdropFilter: 'blur(5px)',
          background: alpha(
            darken(theme.palette.primary.dark, 0.4),
            0.8,
          ),
          borderRadius: 3,
          fontSize: theme.typography.caption.fontSize,
          lineHeight: 1.6,
          userSelect: 'none',
        }),
        popper: {
          pointerEvents: 'none',
        },
      },
    },
    MuiTouchRipple: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiTouchRipple-child': {
            backgroundColor: `${theme.palette.text.secondary} !important`,
            opacity: `${theme.palette.action.activatedOpacity} !important`,
          },
          '& .MuiTouchRipple-childLeaving': {
            backgroundColor: `${theme.palette.primary.main} !important`,
            opacity: `${theme.palette.action.activatedOpacity} !important`,
          },
        }),
      },
    },
  },
};
