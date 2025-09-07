import * as esbuild from 'esbuild';
import { clean } from 'esbuild-plugin-clean';
// eslint-disable-next-line import/no-unresolved -- https://github.com/airbnb/javascript/issues/2853
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { umdWrapper } from 'esbuild-plugin-umd-wrapper';
import TypeGenerator from 'npm-dts';

const isProd = process.env.NODE_ENV === 'production';

const SRC_DIR = './src';
const BUILD_DIR = './dist';
const LIB_NAME = 'ScratchForm';

const ENTRY_FILE = `${SRC_DIR}/${LIB_NAME}.ts`;

(async () => {
  const options = {
    entryPoints: [ENTRY_FILE],
    bundle: true,
    sourcemap: !isProd,
    outfile: `${BUILD_DIR}/${LIB_NAME}.js`,
    minify: isProd,
    platform: 'browser',
    format: 'umd',
    globalName: LIB_NAME,
    target: browserslistToEsbuild('defaults'),
    plugins: [
      clean({
        patterns: [
          `${BUILD_DIR}/*`,
        ],
      }),
      umdWrapper({
        libraryName: LIB_NAME,
      }),
    ],
  };

  if (isProd) {
    await esbuild.build(options);

    new TypeGenerator.Generator({
      entry: ENTRY_FILE,
      output: `${BUILD_DIR}/${LIB_NAME}.d.ts`,
    }).generate();
  } else {
    const ctx = await esbuild.context(options);
    await ctx.watch();
  }
})();
