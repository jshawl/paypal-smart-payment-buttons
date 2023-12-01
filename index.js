/* @flow */
/* eslint import/no-unassigned-import: off, import/no-commonjs: off */

// $FlowFixMe
const pkg = require("./package.json");

const aliases = pkg.alias || {};

for (const [module, alias] of Object.entries(aliases)) {
  const moduleAlias = require("module-alias");

  if (!alias) {
    continue;
  }
  // Alias is interpreted as mixed/any although it is always a string. This comes from Object.entries() not knowing the type the object's value.
  console.info(`Alias: ${module} -> ${String(alias)}`); // eslint-disable-line no-console
  moduleAlias.addAlias(module, String(alias));
}
