import { useState } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import bundler from '../bundler';

const CodeCell = () => {
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  const onClick = async () => {
    const output = await bundler(input);
    setCode(output);
  };

  return (
    <div id="root">
      <CodeEditor
        initialValue="const a=1;"
        onChange={(value) => setInput(value)}
      />
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <Preview code={code} />
    </div>
  );
};

export default CodeCell;
