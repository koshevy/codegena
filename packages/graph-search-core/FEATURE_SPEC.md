# Graph search: feature specification

Graph search lets a person find generated files, directories, declarations,
warnings, and text in the source specification from one search drawer. For
example, searching for `ApiRequest` can lead to its generated declaration and
the matching place in the source editor.

## Who does what

- **Graph Search Core** indexes the graph and source text, ranks results, and
  remembers visits. It has no UI dependency.
- **Graph Search UI** displays the ordered results and reports which one was
  chosen. It does not rank them again.
- **Playground** selects graph nodes, opens panels, and reveals code or warnings
  after a result is chosen.

See the [API example](README.md#use-a-local-index) and the
[ownership decision](adr/001-index-graph-suggestions-and-scope-visits-by-specification.md).

## What a result contains

`GraphSuggestion` gives every result an `id`, a `kind`, and a title. IDs are
unique within an indexed graph; warning IDs follow their position in the log
list. Results for graph nodes also carry a `nodeId`. A source location is
included when one is available.

- **Directory:** Its relative path and counts of directly contained
  directories and files.
- **Declaration:** Its name, declaration type, generated filename, and an
  optional numbered code excerpt.
- **File:** Its generated filename and an optional numbered code excerpt.
- **Warning:** Its message and source location. The code excerpt and caret are
  removed from the search text and are not displayed as a result snippet.
- **Specification:** Its source filename and an optional numbered excerpt when
  the full query appears on one line of source text.

When code contains both capitalized and lowercase matches, its excerpt shows
the first match with the query's capitalization. If none exists, it shows the
first case-insensitive match.

The index searches more than the visible title. It includes generated code,
paths, declaration labels, programming languages, warning details, source
locations (including `line:1526`), and the specification text. One warning
preparation helper supplies both indexed and default warning results.

## What happens when someone searches

`GraphPayloadMiniSearch` builds a [MiniSearch](https://lucaong.github.io/minisearch/)
index for a graph. It offers two methods:

- `getSearchSuggestions(query?)` returns ordered `suggestions` and an
  `isTruncated` flag. With fewer than three query characters, it returns the
  default suggestions. Otherwise, every query term must match; prefixes also
  match.
- `getAutoSuggestion(query)` returns MiniSearch's best completion, or an empty
  string when there is none.

When capitalization does not distinguish the groups, they appear in this order:

1. Directories
2. Declarations
3. Files
4. Warnings
5. Source specification

Kinds with a title containing the query in matching capitalization appear
first. Kinds matching that capitalization in a code excerpt or another indexed
field follow. Within a kind, the same match order applies before MiniSearch
relevance and recent visits. The search UI displays that order as given.

A search shows at most **100 results**. When several kinds match, it reserves
up to **33 declarations, 33 files, 33 warnings, and one source specification**
before filling the remaining places with directories. If only one kind
matches, it can use the full 100 places.
When matches are omitted, `isTruncated` tells the UI to invite a narrower query.

## What appears before a search

Opening search with no query, or with fewer than three characters, shows up to
**10 default suggestions**. The list considers these groups in order, removes
duplicates, then stops at the total limit:

1. Up to **4 recently visited** nodes or warnings.
2. Up to **3 directories**, excluding the root. A direct child directory has
   the weight of five files; related file edges add weight too.
3. Up to **3 declarations**, ranked by their reference relations.
4. Up to **3 files**, ranked by their declaration count.
5. Up to **3 warnings**, ranked by severity.
6. The source specification, without a code excerpt.

The total limit, each group limit, and the minimum query length are options of
`GraphPayloadMiniSearch`.

## How visits survive a reload

`VisitHistory` records visits to graph nodes and warnings. Playground records
node selection in the graph or list, declaration reveals from editor glyphs,
and warning reveals. Search selections use those same navigation paths.

- **In memory:** Recent visits immediately influence default and searched
  results.
- **In a browser:** Dexie saves the journal in IndexedDB. Its live query keeps
  open tabs and worker contexts up to date.
- **Per specification:** Every record has an `ownerSpecId`, so visits to one
  specification do not appear in another's history.

`createDeterministicSpecId` creates that ID from content:

1. Parse valid JSON or JSONC, sort object keys, and serialize it. Whitespace
   and object-key order therefore do not change the ID.
2. Hash the normalized text with SHA-256 and format the first 128 bits as a
   version-8 UUID.
3. If JSONC is invalid, hash its raw text. A partial parse must not make two
   different sources look identical.

Playground calculates the ID once when the specification text changes and
reuses it for history and API requests.

## Where the search runs

The engine works synchronously without browser infrastructure. For background
execution, the host initializes `@codegena/pwa` and registers the search API
module. PWA's Service Worker routes HTTP requests to its SharedWorker
companion, which imports and executes that module.

- **API:** `POST /api/graph-search` accepts `initialize`, `search`,
  `autoSuggest`, and `dispose` operations. Search returns the same ordered
  result as the synchronous engine; completion returns plain text.
- **Input:** The client sends graph data without visitor AST objects. Named
  schemas validate incoming requests and search results.
- **Lifetime:** Each client has its own session ID, index, and history.
  Disposing it releases both subscriptions. Other clients remain independent.
- **Recovery:** A missing session is initialized again before retrying its
  query. Requests time out after ten seconds. If the API is unavailable,
  Playground creates a local index.

Graph Search Core contains no worker registration, worker listeners, message
channels, or worker bootstrap entrypoint. Those responsibilities belong to
PWA. Playground Storybook bundles the PWA scripts and search module from
workspace sources and initializes them before rendering stories.

## What selecting a result does

Playground owns the navigation. A file, directory, or declaration result
selects its graph node and reveals the related view. A warning result reveals
its source line and warning details. A specification result opens at the
matching source text when the full query appears on one line; otherwise it
opens at the start of the specification.

## How the behavior is checked

- **Jest:** Suggestion kinds, warning preparation, ranking, recent visits, and
  stable specification IDs, HTTP input validation, session isolation, and client
  initialization and disposal.
- **Storybook:** Result presentation, empty results, and overflowing lists.
- **Playwright:** Search, cross-panel navigation, reload persistence, and
  synchronization between tabs in the composed Playground.
