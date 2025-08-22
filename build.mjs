import * as esbuild from 'esbuild';
import { clean } from 'esbuild-plugin-clean';

const isProd = process.env.NODE_ENV === 'production';

const BUILD_DIR = './demo';
const MAIN_FILE = 'main.js';

(async () => {
  const options = {
    entryPoints: [`./src/${MAIN_FILE}`],
    bundle: true,
    sourcemap: !isProd,
    outdir: BUILD_DIR,
    minify: isProd,
    plugins: [
      clean({
        patterns: [
          `${BUILD_DIR}/main.js*`,
        ],
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
