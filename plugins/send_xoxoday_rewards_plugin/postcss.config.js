const postcssPresetEnv = require('postcss-preset-env');
const reporter = require('postcss-reporter');

module.exports = {
  plugins: [
    postcssPresetEnv, // includes autoprefixer as well
    reporter({ clearReportedMessages: true }),
  ],
};
