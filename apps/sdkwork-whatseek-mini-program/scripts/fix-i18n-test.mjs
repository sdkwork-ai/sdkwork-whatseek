// One-shot patcher: append the i18n layout + key-parity check to the mp
// contract test. Run from apps/sdkwork-whatseek-mini-program.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tests/mini-program-surface-contract.test.mjs';
let t = readFileSync(p, 'utf8');
if (t.includes('i18n_fragments')) {
  console.log('already patched');
  process.exit(0);
}

t += `
test('every_capability_package_ships_zh_en_i18n_fragments_with_key_parity', () => {
  const packages = ['core', 'commons', 'shell', 'chat', 'apps', 'contacts', 'messages', 'profile'];
  const keyPaths = (value, prefix = '') => {
    if (typeof value !== 'object' || value === null) return new Set([prefix]);
    const keys = new Set();
    for (const [key, child] of Object.entries(value)) {
      for (const nested of keyPaths(child, prefix.length === 0 ? key : prefix + '.' + key)) {
        keys.add(nested);
      }
    }
    return keys;
  };
  for (const name of packages) {
    const read = (locale) => JSON.parse(readFileSync(
      path.join(
        surfaceRoot,
        'packages',
        ['sdkwork-whatseek-mp', name].join('-'),
        'src', 'i18n', locale, 'whatseek', name, 'strings.json',
      ),
      'utf8',
    ));
    const zh = read('zh-CN');
    const en = read('en-US');
    assert.deepEqual([...keyPaths(en)].sort(), [...keyPaths(zh)].sort(), ['locale key drift in mp-', name].join(''));
  }
});
`;

writeFileSync(p, t);
console.log('contract test extended');
