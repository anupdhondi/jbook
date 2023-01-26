import * as esbuild from 'esbuild-wasm';
import localforage from 'localforage';
import axios from 'axios';

const fileCache = localforage.createInstance({
  name: 'filecache',
});

export const fetchPlugin = (input: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: 'jsx',
          contents: input,
        };
      });

      build.onLoad({ filter: /.*/ }, async (args) => {
        //check to see if we already fetched file and if it is in cache
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        //if it is cached, return immediately
        if (cachedResult) {
          return cachedResult;
        }
      });

      build.onLoad({ filter: /.css$/ }, async (args) => {
        const { data, request } = await axios.get(args.path);

        const escaped = data
          .replace(/\n/g, '')
          .replace(/"/g, /\\"/)
          .replace(/'/g, /\\'/);

        const contents = `
    const style = document.createElement('style');
    style.innerText = '${escaped}';
    document.head.appendChild(style)`;

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents,
          //see video to undestand below URL code
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        //store response in cache
        await fileCache.setItem(args.path, result);

        return result;
      });

      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        const { data, request } = await axios.get(args.path);

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          //see video to undestand below URL code
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        //store response in cache
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
