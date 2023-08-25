/* @flow */
/* eslint import/no-unassigned-import: off, import/no-commonjs: off */

const pkg = require('./package.json');

const aliases = pkg.alias || {};

for (const [ module, alias ] of Object.entries(aliases)) {
    const moduleAlias = require('module-alias');

    if (!alias) {
        continue;
    }

    // $FlowFixMe
    console.info(`Alias: ${ module } -> ${ alias }`); // eslint-disable-line no-console
    moduleAlias.addAlias(module, alias);
}
