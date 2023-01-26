//Esbuild code
import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-pliugin';

let service: esbuild.Service;
const bundle = async (rawCode: string) => {
  if (!service) {
    service = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  }

  const result = await service.build({
    entryPoints: ['index.js'],
    bundle: true,
    write: false,
    //to remove warnings on console. while fetching we will get production code only
    define: {
      'process.env.NODE_ENV': '"production"',
      global: 'window',
    },
    plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
  });

  return result.outputFiles[0].text;
};

export default bundle;
