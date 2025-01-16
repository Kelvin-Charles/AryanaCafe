const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

plugins: [
  // Generates an `index.html` file with the <script> injected.
  new HtmlWebpackPlugin(
    // ... existing code ...  
  ),
  // Prevents users from importing files from outside of src/ (or node_modules/).
  // This often causes confusion because we only process files within src/ with babel.
  // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
  // please link the files into your node_modules/ and let module-resolution kick in.
  // Make sure your source files are compiled, as they will not be processed in any way.
  new ModuleScopePlugin(paths.appSrc, [
    paths.appPackageJson,
    reactRefreshRuntimeEntry,
    reactRefreshWebpackPluginRuntimeEntry,
    babelRuntimeEntry,
    babelRuntimeEntryHelpers,
    babelRuntimeRegenerator,
  ]),
  // ... existing code ...
],
resolve: {
  modules: ['node_modules', paths.appNodeModules].concat(
    modules.additionalModulePaths || []
  ),
}, 