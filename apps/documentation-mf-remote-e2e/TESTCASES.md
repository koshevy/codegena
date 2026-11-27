# Documentation remote browser cases

Run `npm exec -- nx run documentation-mf-remote-e2e:e2e`.
Use headless desktop Chrome and iPhone 15 with isolated contexts and no retries.

- **Implemented · P0 — Documentation navigation:** Open Roadmap and status, Get started,
  About, Contacts, then visit
  Core features, Extend, Contribute, Security, Personal data privacy, FAQ, and
  Blog. Each destination has its own heading and working navigation.
- **Implemented · P0 — Narrow navigation:** Open the documentation menu at
  narrow desktop and mobile widths. Article links remain visible below the
  header; choosing one opens that article and closes the menu.
- **Implemented · P0 — Shared appearance:** Switch between light and dark themes.
  The page, shared code editor, logo, and footer follow the selected mode.
- **Implemented · P0 — Local code editor:** Open a code example and verify readable,
  highlighted code without requests to an editor CDN or browser errors.
- **Implemented · P1 — Article styles:** Check the transparent header at the
  top and its fade into the tinted surface after scrolling one rem. Verify that
  reduced motion disables the fade. Read highlighted Bash, sh, and TSX examples
  with even padding and without a highlighted row.
  On wide screens, check that the header and article columns share the same
  centered width and that the sidebar has no dividing border.
- **Implemented · P1 — React in MDX:** Read the themed callout and switch between
  the Install and Generate tabs with the keyboard and pointer.
- **Implemented · P0 — Federation entry:** A separately built Rspack host loads
  the public App export, opens documentation, and navigates with normal browser
  article URLs. Both host and remote keep the browser console free of warnings
  and errors, including the development hot-reload connection.

The default run uses the development server on port 8113 and a federation host
on port 8114. Use `DOCUMENTATION_E2E_SERVER=production` to run the same journeys
against the production build. Starter articles are MDX files.
