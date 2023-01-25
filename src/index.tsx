import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-pliugin';

const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  };
  useEffect(() => {
    startService();
  }, []);

  const onClick = async () => {
    if (!ref.current) {
      return;
    }

    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      //to remove warnings on console. while fetching we will get production code only
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
    });

    // console.log(result);

    setCode(result.outputFiles[0].text);

    //eval is build into browser to execute js code which is in string format
    try {
      eval(result.outputFiles[0].text);
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div id="root">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
      {/* we allow direct access between parent html and iframe only if we set 'sandbox' to 'allow-same-origin' or not setting 'sandbox' 
       and if we fetch parent html and iframe html from the exact same domain,port and protocol */}
      {/* If 'sandbox' set to "" then there wont be any access */}
      <iframe srcDoc={html} sandbox="allow-same-origin"></iframe>
    </div>
  );
};

const html = `
<h1> World!</h1>
`;

ReactDOM.render(<App />, document.querySelector('#root'));
