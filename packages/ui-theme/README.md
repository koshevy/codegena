# UI Theme

`@codegena/ui-theme` provides the shared MUI light and dark themes, palette tokens, and typography for Codegena UI. Preview both themes with `npm exec -- nx run @codegena/ui-theme:storybook`.

UI Storybooks import the default preview from `@codegena/ui-theme/storybook`. It supplies the theme, CSS baseline, and a margin-free page using the theme's paper background. Set `parameters: { codegenaTheme: 'dark' }` on a story that needs the dark theme; feature-specific providers remain in that library's preview or story.

## Startup stylesheet

Serve [`@codegena/ui-theme/assets/reset.css`](assets/reset.css) beside the
font assets. Preload the stylesheet and the Golos Text startup font from
the HTML head. Add `GlobalCSS__preloading` to the body and a
`GlobalCSS__preloader` element with an accessible loading label. The startup
gradient and line follow the device color scheme.

Use `GlobalCSS__preloadingMessage` for text that should appear after 1.5
seconds. Call `setPreloadingStateOff()` when the first styled route renders.

## Palette

Accent tones use the same contrast order in both themes: `dark` is the stronger
tone against the page background, and `light` is softer. In the dark theme this
means `dark` is visually lighter. See the [palette decision](adr/001-order-accent-tones-by-contrast.md).

For a deliberately pale surface in both themes, use
`palette.secondary.lightSurface` for its fill and `palette.secondary.onLight`
for its accent foreground (available for all six accent colors). Do not swap `light` and `dark` in components based on
`palette.mode`. `contrastText` remains the foreground for `main`.
