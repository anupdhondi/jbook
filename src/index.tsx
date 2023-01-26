import 'bulmaswatch/superhero/bulmaswatch.min.css';
import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-pliugin';
import CodeEditor from './components/code-editor';

const App = () => {
  const ref = useRef<any>();
  const iframRef = useRef<any>();
  const [input, setInput] = useState('');

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

    iframRef.current.srcdoc = html;

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

    //setCode(result.outputFiles[0].text);
    iframRef.current.contentWindow.postMessage(result.outputFiles[0].text, '*');

    //eval is build into browser to execute js code which is in string format
    // try {
    //   eval(result.outputFiles[0].text);
    // } catch (err) {
    //   alert(err);
    // }
  };

  const html = `
  <html lang="en">
  <head>
  </head>
  <body>
      <div id="root"></div>
      <script>
       window.addEventListener("message",e => {
         try {
          eval(e.data)
        } catch (err) {
           document.querySelector("#root").innerHTML = '<div style="color: red"> <h4>Runtime Error</h4>' + err + '</div>'; 
           console.error(err);
          }
       },false)
      </script>
  </body>
  </html>
  `;

  return (
    <div id="root">
      <CodeEditor
        initialValue="const a=1;"
        onChange={(value) => setInput(value)}
      />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      {/* we allow direct access between parent html and iframe only if we set 'sandbox' to 'allow-same-origin' or not setting 'sandbox' 
       and if we fetch parent html and iframe html from the exact same domain,port and protocol */}
      {/* If 'sandbox' set to "" then there wont be any access */}
      <iframe
        title="preview"
        ref={iframRef}
        srcDoc={html}
        sandbox="allow-scripts"></iframe>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
