const { readdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join, resolve, sep } = require('node:path');
const { createInstrumenter } = require('istanbul-lib-instrument');

const browserDir = resolve('dist/e2e/browser');
const sourceDir = resolve('src') + sep;
let instrumented = 0;

for (const mapName of readdirSync(browserDir).filter(name => name.endsWith('.js.map'))) {
  const mapPath = join(browserDir, mapName);
  const sourceMap = JSON.parse(readFileSync(mapPath, 'utf8'));
  // Angular emits source paths relative to the workspace, while Istanbul resolves them from the bundle.
  sourceMap.sources = sourceMap.sources.map(source => resolve(sourceMap.sourceRoot ?? '', source));
  delete sourceMap.sourceRoot;
  if (!sourceMap.sources.some(source => source.startsWith(sourceDir) && source.endsWith('.ts'))) {
    continue;
  }

  const bundlePath = mapPath.slice(0, -'.map'.length);
  const code = readFileSync(bundlePath, 'utf8').replace(/^\/\/# sourceMappingURL=.*$/m, '');
  const instrumenter = createInstrumenter({ esModules: true, produceSourceMap: true });
  const instrumentedCode = instrumenter.instrumentSync(code, bundlePath, sourceMap);

  writeFileSync(bundlePath, instrumentedCode + '\n//# sourceMappingURL=' + mapName + '\n');
  writeFileSync(mapPath, JSON.stringify(instrumenter.lastSourceMap()));
  instrumented++;
}

if (instrumented === 0) {
  throw new Error('No Angular application bundles were instrumented for Cypress.');
}
