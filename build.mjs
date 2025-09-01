import * as esbuild from 'esbuild';
import { clean } from 'esbuild-plugin-clean';
// eslint-disable-next-line import/no-unresolved -- https://github.com/airbnb/javascript/issues/2853
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { umdWrapper } from 'esbuild-plugin-umd-wrapper';

const isProd = process.env.NODE_ENV === 'production';

const BUILD_DIR = './dist';
const LIB_NAME = 'ScratchForm';

(async () => {
  const options = {
    entryPoints: [`./src/${LIB_NAME}.js`],
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
          `${BUILD_DIR}/${LIB_NAME}*`,
        ],
      }),
      umdWrapper({
        libraryName: LIB_NAME,
      }),
    ],
  };

  if (isProd) {
    esbuild.build(options);
  } else {
    const ctx = await esbuild.context(options);
    await ctx.watch();
  }
})();
