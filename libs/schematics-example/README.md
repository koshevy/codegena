# schematics-example

## Development

How to build and use schematic:

**Step 1:** Build `schematics-example` library (from repo root):
```
nx build schematics-example --with-deps
```

**Step 2:** Build schematic of `schematics-example` library (from repo root):
```
npm run --prefix libs/schematics-example build
```

**Step 3:** Link just created schematic and buit deps (from repo root):
```
npm run --prefix libs/schematics-example link:libs:built
```

**Step 4:** Use schematic as if it was already in `node_modules`.

## Using schematic

```
ng g @codegena/schematics-example:backend-services
```

## Revert workspace

After developing of schematics revert correct workspace:

```
npm i
```

## Complete example

Run command from repository root:

```
npm run todo-app-contract:update
```
