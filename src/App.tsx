import React, { useEffect, useState } from 'react';

import * as esbuild from 'esbuild-wasm';

function App() {
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  const startService = async () => {
    const service = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm',
    });
    console.log('🚀 ~ file: App.tsx:15 ~ startService ~ service', service);
  };

  useEffect(() => {
    startService();
  }, []);

  const onClick = () => {};
  return (
    <div>
      <textarea
        onChange={(e) => setInput(e.target.value)}
        value={input}></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
    </div>
  );
}

export default App;
