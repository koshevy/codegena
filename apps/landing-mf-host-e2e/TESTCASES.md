# Landing host E2E cases

**Status:** ✅ Implemented · ⏳ Needed

**Priority:** 🔴 P0 critical · 🟡 P1 important · 🟢 P2 supplementary

| Status | Priority | User path |
| --- | --- | --- |
| ✅ Implemented | 🔴 P0 | 01.01 — Open the welcome screen and check its stacked loop and CODEGENA wordmark, heading, actions, and image. |
| ✅ Implemented | 🔴 P0 | 01.02 — Scroll through the hero title, intro, prompt, and final heading into the second screen. Check the title’s accent colors in motion, its single color at rest, the gently zooming contour pattern, and the second-screen code editor image. |
| ✅ Implemented | 🔴 P0 | 01.07 — Enter the second screen and wait for its illustration to finish moving and scaling before capturing the code editor. The readiness check must not accept a nearly finished animation. |
| ✅ Implemented | 🟡 P1 | 01.03 — Copy the full AI assistant prompt from the hero icon button; its tooltip explains the action on keyboard focus. |
| ✅ Implemented | 🟡 P1 | 01.04 — As the playground panel enters, the hero contour pattern and glow fill the gaps on both sides while the panel covers them. |
| ✅ Implemented | 🔴 P0 | 01.05 — Use the hero actions to reach the complete AI prompt, then the feature story, or jump directly to the browser playground. Check that the second screen peeks in without covering the hero controls. |
| ✅ Implemented | 🟡 P1 | 01.06 — Find the shared navigation links in the header and overlay. On desktop, Get started and Playground occupy the right column with the same row spacing as the left; mobile retains one list. Check keyboard focus, the wordmark, and contact alignment. |
| ✅ Implemented | 🟡 P1 | 01.08 — Choose Light from the header theme menu, reload, and retain that choice. Check the light welcome and overlay images. The overlay theme column is visible only at desktop widths. The Unified UI title uses primary text color until the blob covers the screen, then turns white. Scroll back to restore primary text color. “Select example:” stays near-white. |
| ✅ Implemented | 🟡 P1 | 01.09 — Open the theme menu with the keyboard and restore focus on Escape. Choose System and follow device color changes; explicit Dark and Light choices remain stable. |
| ✅ Implemented | 🟡 P1 | 01.10 — On desktop, select Light, System, and Dark from the full-page menu. Each selection closes the menu and returns focus to its button; reopening retains the selected choice. The Theme heading matches the left column's font size. |
| ✅ Implemented | 🟡 P1 | 01.12 — Keep the scroll invitation only in the welcome screen. On wide pages, its mouse wheel moves down and back; reduced motion stops it. At widths up to 700px, hide progress lines, the footer count, and document scrollbar; widening restores them and the page remains scrollable. |
| ✅ Implemented | 🟡 P1 | 01.13 — Keep the smaller logo centered between the header and title while its gradient flows. Turn on reduced motion and retain the still gradient. |
| ✅ Implemented | 🟡 P1 | 01.14 — Watch the shared wordmark's gradient flow in the footer. Turn on reduced motion and retain a still wordmark. The hero and both menu overlays reuse the same lettering. |
| ✅ Implemented | 🟡 P1 | 01.15 — At a 960px viewport, use the overlay menu instead of wrapping header links. Roadmap and status stays readable and Playground is last. |
| ✅ Implemented | 🔴 P0 | 01.16 — Hold the initial scripts to see the HTML loading line. Release them and hold the feature bundle for two seconds to see the warning. Both the warning and the landing loading line disappear when content arrives. |
| ✅ Implemented | 🟡 P1 | 01.17 — Open a bookmarked Ideology link and scroll to the section when the deferred content arrives. |
| ✅ Implemented | 🟡 P1 | 01.18 — Reopen landing in the same tab and restore its saved position when the deferred features arrive. |
| ✅ Implemented | 🔴 P0 | 01.19 — Open the production landing page in a fresh tab and see the welcome view and navigation within a 1 MB uncompressed startup budget. |
| ✅ Implemented | 🟡 P1 | 01.20 — Load the page with JavaScript disabled. Check that the preload and stylesheet share the hashed reset URL, Golos preloads, and the themed message appears after 1.5 seconds. |
| ✅ Implemented | 🟡 P1 | 01.21 — Block the Nebula download, scroll to Unified UI, and open the Petstore example. |
| ✅ Implemented | 🟡 P1 | 01.22 — Click How it works, then open the menu as the hero scrolls. The hero stops moving and remains visible as the overlay slides in. |
| ✅ Implemented | 🟡 P1 | 01.23 — Hold the lower landing sections and observe the worker download the navigation overlay. Release the sections and see the worker download Search and the Playground entry while the editor and shaders remain deferred. Open the menu and verify it uses the cached script. |
| ✅ Implemented | 🟡 P1 | 01.24 — Open the landing page and check that its Web App Manifest and both installation icons are available. |
| ✅ Implemented | 🟡 P1 | 01.25 — Read the cookie notice before feature bundles load, verify the privacy and repository links, and reload after declining analytics. |
| ✅ Implemented | 🟡 P1 | 01.26 — Open navigation with the cookie notice visible, then close the menu and return to the notice. |
| ✅ Implemented | 🟡 P1 | CONSENT-01 — Open each documentation and blog page with a fresh browser context and find the cookie notice. |
| ✅ Implemented | 🟡 P1 | CONSENT-02 — Open Playground directly and find the same notice. |
| ✅ Implemented | 🟡 P1 | CONSENT-03 — Accept all or disable analytics in Docs, then navigate to landing, Playground, and another article without seeing the notice again. |
| ✅ Implemented | 🟡 P1 | 02.00 — Follow the centered progress blob down each feature's scroll path and see it restart at the next feature. |
| ✅ Implemented | 🟡 P1 | 02.00 — Scroll through a feature with WebGPU enabled and verify Chrome reports no layout shifts for the moving blob. |
| ✅ Implemented | 🟡 P1 | 02.00 — Watch the blob start growing about 100px before section 05 ends, remain smaller than the screen there, then fill section 06 and stop. |
| ✅ Implemented | 🟡 P1 | 02.06 — Choose each theme and open Unified UI. Pale description panels and example buttons retain dark accent text in both modes. |
| ✅ Implemented | 🟡 P1 | 02.06 — Once the blob fills the screen, hold its rendered frame and pause its shape morph. Further downward scrolling keeps it frozen; scrolling backward resumes the same animation without resetting it. |
| ✅ Implemented | 🔴 P0 | 02.06 — With live WebGPU rendering enabled, reach Unified UI, see Nebula draw, and check that the blob pauses at full size and resumes on backward scrolling. The full shader registry stays unloaded. |
| ✅ Implemented | 🔴 P0 | 02.01 — Visit each JSON Schema code example. Check its file, declaration, description, and image. Verify all examples have highlighted code before selection, only the active example is accessible, and changing captions preserves the editor height and page scroll position. |
| ✅ Implemented | 🟡 P1 | 02.01 — Scroll forward and back through the longer JSON Schema section; its active code example follows each equal share of the section's path. |
| ✅ Implemented | 🟡 P1 | 02.01 — Scroll inside a code slide by wheel or touch without moving the landing page. On mobile, pan through the preview and scroll again in the expanded drawer. |
| ✅ Implemented | 🟡 P1 | 02.02 — Read the CLI story with the same caption presentation as other illustrations, leave and return to the same scroll position, and check its image. |
| ✅ Implemented | 🟡 P1 | 02.02 — Scroll through command typing, greeting, and diagnostics; pause and reverse to verify that the terminal follows page position. |
| ✅ Implemented | 🟡 P1 | 02.02 — On desktop, a touchpad advances the page while terminal output fits; once output overflows, it scrolls inside the terminal. |
| ✅ Implemented | 🟡 P1 | 02.02 — On mobile, open the terminal peel during partial playback, close it, then continue scrolling to the complete output. |
| ✅ Implemented | 🟡 P1 | 02.03 — Expand `items/_common` and reveal a generated file. Verify the adjacent code slide stays outside the viewport, then check the image. |
| ✅ Implemented | 🟡 P1 | 02.03 — At 15%, 30%, 45%, and 60% of the section, expand `_common`, `vaults`, `vaults/_common`, and show the code example. Reverse scrolling to restore each prior state. |
| ✅ Implemented | 🟡 P1 | 02.03 — On desktop, manually collapse `vaults` in the preview. Continue scrolling and verify it reopens. |
| ✅ Implemented | 🟡 P1 | 02.03 — On mobile, open the folder drawer, expand `items` in its tree, and close the drawer. |
| ✅ Implemented | 🟡 P1 | 02.03 — Switch to the domain namespace example and inspect its filename, code, and explanation. |
| ✅ Implemented | 🟡 P1 | 02.03 — On mobile, open the domain namespace code as a peel drawer. |
| ✅ Implemented | 🟡 P1 | 02.03 — On desktop, scroll the generated folder list with a touchpad while the page stays still. |
| ✅ Implemented | 🔴 P0 | 02.04 — Find the accessible GitHub API search button beside the circular invitation, open the dialog, and find a declaration from the prepared graph through the PWA virtual HTTP search service. |
| ✅ Implemented | 🟡 P1 | 02.04 — Open search, scroll against its backdrop, and confirm the landing page stays still until the drawer closes. |
| ✅ Implemented | 🟡 P1 | 02.05 — Scroll to the IDE plugins story and see the VS Code, JetBrains, and Cursor preview within the circular “Soon!” ring. Check its image. |
| ✅ Implemented | 🟡 P1 | 02.05 — Move between the graph-search and IDE stories; their rotating text circles keep the same screen center. |
| ✅ Implemented | 🟡 P1 | 02.06 — See the browser-based Unified UI message, “Select example:” heading, and three demo choices as the blob fills the screen and holds its position. The heading keeps the ideology headings' relative letter spacing on desktop and mobile. |
| ✅ Implemented | 🟡 P1 | 02.06 — Read opaque dark-secondary text on translucent contrasting surfaces in the description, demo buttons, and bottom progress labels. The pointer stays above the buttons, and the documentation link is absent only in Unified UI. |
| ✅ Implemented | 🟡 P1 | 02.06 — Choose each Unified UI demo; the button list zooms toward the chosen button's center while the section copy slides and fades away, then the full-screen overlay appears. Return through the Playground navigation menu. |
| ✅ Implemented | 🔴 P0 | 02.06 — Open the Petstore, 1Password, and GitHub examples through Module Federation. Each converts its selected same-origin specification through PWA, shows matching declarations in search, and opens its explicit specification URL. Escape closes search while keeping Playground open; Return to landing in the navigation menu returns to the existing section. |
| ✅ Implemented | 🔴 P0 | 02.06 — Select the root namespace and a nested declaration in the embedded graph. Both code panels reveal the related lines. Check the active generated line against the declaration by name. Show all and closing/reopening details preserve navigation without native resize errors. |
| ✅ Implemented | 🔴 P0 | 02.06 — Expand/collapse a directory in List, select its declaration, and reveal a root warning. Both editors navigate, selection survives collapsing the directory, and the warning source can expand and collapse. F8 opens Monaco’s warning viewer inside the overlay. |
| ✅ Implemented | 🔴 P0 | 02.06 — Close the appearance menu with Escape, select a search result, open and close the source symbol picker, and return to landing. Open Petstore next and confirm the previous example's declarations do not leak into search. |
| ✅ Implemented | 🟡 P1 | 02.06 — Scroll through Unified UI and back; a full-width, 6rem-high glitch line appears after the blob fills the screen and follows the page from top to bottom. |
| ✅ Implemented | 🟡 P1 | 02.06 — Open Petstore from landing, then open its sandwich menu. The Playground remains visible and still during the slide. |
| ✅ Implemented | 🟡 P1 | 02.07 — Open the sandwich menu in each of the six feature chapters. Each chapter stays in view and in place as the overlay slides in. |
| ✅ Implemented | 🟡 P1 | 03.00 — Scroll from the playground to ideology and back; the playground recedes like a bottom peel, ideology contours zoom in on return, and the full-size Unified UI section remains visible before IDE Plugins returns. |
| ✅ Implemented | 🟡 P1 | 03.01 — Scroll through the final ideology section and read the complexity-management introduction and five numbered principles. |
| ✅ Implemented | 🟡 P1 | 03.02 — Reach the page footer and find the same navigation, wordmark, social links, and contact details as the menu overlay. The wordmark precedes Security and Personal data privacy at bottom-left. Check its image. |
| ✅ Implemented | 🟡 P1 | 03.04 — Open the menu over Ideology and the footer. Their content stays visible and still until the overlay covers it. |
| ✅ Implemented | 🟡 P1 | 01.11 — Open the header theme menu without moving the header or changing the page width; the document scrollbar overlays content. |
| ✅ Implemented | 🔴 P0 | 02.06 — Open Playground's sandwich menu, confirm the shared wordmark and selected, disabled current example, switch examples, dismiss with Escape, and return to landing. Host and Playground share the saved theme. |
| ✅ Implemented | 🔴 P0 | 02.06 — Hold the conversion worker download in both dark and light appearance. The converting placeholder and ready Playground retain the host's theme. |
| ✅ Implemented | 🟡 P1 | 02.06 — Dolly buttons transition to the overlay's paper background; the glitch retains its dark-theme gradient in light appearance. |

## Under construction

- **Implemented · P1 — CONSTRUCTION-01:** Open a fresh landing session, read the
  construction notice before the cookie notice, and acknowledge it. Reload
  and open Docs in the same tab with the notice dismissed. Check that a separate
  tab still receives the notice.
- **Implemented · P1 — CONSTRUCTION-02:** Open Docs or Playground directly in a
  fresh session and see the same construction notice.

## Documentation routes

- **Implemented · P0 — DOCS-00:** Hold the Nx-configured remote download, check the HTML
  preloader, then display documentation and dismiss the line.
- **Implemented · P0 — DOCS-01:** Open `/docs/core-features` directly, follow
  an article link, use Back/Forward, and reload the article at its browser URL.
- **Implemented · P0 — DOCS-02:** Open Docs through the desktop header.
  The docs header is transparent at the top and shares the landing header’s
  surface, height, and shadow after scrolling.
- **Implemented · P0 — DOCS-03:** Confirm landing does not fetch remote entries
  until navigation requests one. Open Docs through the footer and landing menu
  on desktop and iPhone 15.
- **Implemented · P0 — DOCS-04:** Open Docs through the embedded Playground's
  menu and confirm that documentation replaces the overlay and landing page.

- **Implemented · P0 — DOCS-05:** Navigate to Core features and let delayed
  progress work finish; the loading bar must remain absent after completion.
- **Implemented · P1 — DOCS-06:** Match the landing header frame and shadow,
  switch themes, and verify that Blog selection does not also select Docs.
- **Implemented · P0 — DOCS-07:** Open the default 1Password Playground from
  docs, verify its encoded `specUrl`, reload, and return to landing.
- **Implemented · P0 — DOCS-08:** Navigate from the terminal to articles and
  back without reloading; documentation styles must not add terminal pads.
- **Implemented · P0 — DOCS-09:** Open `/docs` directly and verify the native
  header gutters and hidden skip link, proving that layout CSS is active.
- **Implemented · P1 — DOCS-10:** Follow an article by keyboard; Tab must start
  at its skip link rather than continue through the old footer.
- **Implemented · P1 — DOCS-11:** On mobile, Back closes the open documentation
  menu first. A second Back returns to the previous article.
- **Implemented · P0 — DOCS-12:** Follow a table-of-contents link on desktop or
  mobile. Stay on the article, reveal the target heading, and reload its fragment.
- **Implemented · P0 — DOCS-13:** Open Roadmap and status, About, and Contacts
  through landing menus and footer. Return through the docs footer wordmark,
  reload each article, and check its main-menu selection.
- **Implemented · P1 — DOCS-14:** Open Personal data privacy from the landing
  overlay's policy links.
- **Implemented · P1 — DOCS-15:** Check desktop menu and sidebar order, sidebar
  spacing, body-sized contents links, and pagination link styles. Follow the
  destination titles forward and back.
- **Implemented · P0 — DOCS-16:** Open the original documentation menu in dark
  and light themes at narrow desktop and mobile widths. Its drawer and backdrop
  fill the viewport. Dismiss it through the backdrop or close button, navigate
  to an article, and switch to the main menu without clipping its links.

Every documentation journey checks browser diagnostics. The desktop-only header
case follows the existing `@desktop-menu` convention; other cases run on both devices.

## Server rendering

Run the [server rendering cases](ssr/server-rendering.spec.ts) with
`npm exec -- nx run landing-mf-host-e2e:e2e-ssr`. Nx builds the production
images, and Playwright starts and removes a dedicated Bun and Caddy stack.
Docker Compose and local port 8443 must be available.

- **SSR-01.** Read the welcome heading, the six feature sections, and Ideology
  with JavaScript disabled. Verify the example and footer links are present.
- **SSR-02.** Hold the startup script, then let the welcome view hydrate while
  the feature bundle is pending. Verify the saved theme, retained server
  content, and handoff to the live story at the same height. Open and reload
  federated Docs.
- **SSR-03.** Open `/playground` directly and see the default 1Password
  specification converted in the federated Playground.
- **SSR-04.** Fail the interactive bundle request and verify the complete
  server-rendered page stays available. Open Docs and return to the landing
  within the same browser session. Verify the live story loads on return.
- **SSR-05.** Wait for the startup files to cache. Reload the home page and
  verify the empty React root mounts the live welcome from cached assets.
  Verify the first code example has highlighted source before scrolling. Evict the reset
  stylesheet and reload to verify SSR returns.
- **SSR-06.** Hold the bootstrap bundle on mobile. Verify the menu button is
  visible and disabled. Release the bundle, open the menu with one click,
  and follow Personal data privacy.

## Quality metrics

Run `npm exec -- nx run landing-mf-host-e2e:e2e-quality` with Docker Compose
running. Lighthouse connects to the dedicated Chrome launcher on the Caddy
network. The audit stack uses no host ports.

- **QUALITY-01.** Audit the cold SSR homepage over HTTPS with Lighthouse's
  default mobile profile. Require 100 in Performance, Accessibility,
  Best Practices, and SEO. The audit browser accepts Caddy's local certificate
  and ignores the halo's exact WebGL-context error on this GPU-less runner.
- Copy the HTML and JSON reports from the stopped audit container after any
  completed audit, including a failed score.

  ```sh
  mkdir -p dist/reports/landing-quality
  docker compose --env-file apps/landing-mf-host-ssr/.env.local -f apps/landing-mf-host-e2e/docker-compose.yml \
    --profile quality cp quality:/workspace/dist/reports/landing-quality/. \
    dist/reports/landing-quality/
  ```

## Check TypeScript

Run `npm exec -- nx run landing-mf-host-e2e:typecheck` to check the browser
specs, their helpers, and the Playwright configurations without emitting files.
Run `npm exec -- nx sync:check` to verify project-reference synchronization.

## Browser and snapshot policy

- Run `npm exec -- nx run landing-mf-host-e2e:e2e` to build the landing
  production bundle, serve it in the project's Alpine container, and run desktop
  and iPhone 15 Playwright tests. The `docker-compose-build` and
  `docker-compose-up` targets provide the same build and execution steps.
- Use `npm exec -- nx run landing-mf-host-e2e:e2e:native` to use an installed
  Playwright Chromium and the native preview server instead.
- Copy browser reports and test output from the stopped Playwright container.

  ```sh
  mkdir -p dist/.playwright/apps/landing-mf-host-e2e
  docker compose --env-file apps/landing-mf-host-ssr/.env.local -f apps/landing-mf-host-e2e/docker-compose.yml \
    cp playwright:/workspace/dist/.playwright/apps/landing-mf-host-e2e/. \
    dist/.playwright/apps/landing-mf-host-e2e/
  ```

- Every landing journey **MUST** run in both desktop Chrome and iPhone 15 mode.
- Device-specific gestures **MUST** run only where a person can perform them;
  the touchpad journey runs on desktop, and the peel drawer journey runs on
  iPhone 15 mode.
- The iPhone 15 project emulates its viewport and touch capability in headless
  Chromium with a Chrome mobile user agent. Safari behavior is outside this
  suite.
- A changed image baseline **MUST NOT** be accepted without human approval.
  Show the old image, new image, and visual difference before asking. A failing
  image comparison stays failed until approval.
- New image baselines **MAY** be created for new journeys. Review their content
  before committing them.
- Open `/?testingMode=true` to enable deterministic behavior for predictable
  tests. Visual cases retain the CSS glow and progress marker while decorative
  WebGL and WebGPU canvases stay off.
- Hold animated logo and wordmark gradients at their first SVG frame with
  `freezeSvgAnimation` before image comparisons. Cases 01.13 and 01.14 check
  their real animation separately.
- Live GPU checks open `/` in headless Chromium with `--enable-gpu`. The
  Docker browser uses Mesa's software Vulkan driver for WebGPU. The checks
  retain the renderer and count native canvas frames while scrolling.
  Enabling WebGPU alone does not enable headless GPU compositing; a shader
  reporting ready is not enough to prove it continues rendering.
- The live GPU journey also checks shader compilation warnings. The
  [version-specific shader fix](../landing-mf-host/patches/README.md) preserves fragment UV
  inputs and unsigned noise rotation without disabling compiler diagnostics.
- Each significant phase **MUST** check browser console warnings and errors as
  well as visible, accessible results.
- Run `npm exec -- nx run landing-mf-host-e2e:e2e:development` to check all three
  federated examples, documentation routes, and embedded smoke paths against the
  normal development server, on both devices. These checks include native window
  errors, which can appear in the development overlay without a console or
  Playwright page error.

## Adding the next second-screen item

1. Add the next numbered `screen-02-item-<number>-<topic>.spec.ts`. Keep
   `02.01` for the JSON Schema item and its carousel examples.
2. Start at the top of the landing page and scroll to the next item. Check its
   heading and copy by role and name.
3. Check each significant state of the item. For a carousel, check every
   example with a named image; number images by screen, item, then example.
4. Run the same spec in both browser projects. Review proposed baseline changes
   with a human before updating them.
