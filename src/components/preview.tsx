import React, { useEffect, useRef } from 'react';

interface PreviewProps {
  code: string;
}

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

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const iframRef = useRef<any>();

  useEffect(() => {
    iframRef.current.srcdoc = html;
    //setCode(result.outputFiles[0].text);
    iframRef.current.contentWindow.postMessage(code, '*');
  }, [code]);

  return (
    <>
      {/* we allow direct access between parent html and iframe only if we set 'sandbox' to 'allow-same-origin' or not setting 'sandbox' 
       and if we fetch parent html and iframe html from the exact same domain,port and protocol
      If 'sandbox' set to "" then there wont be any access */}
      <iframe
        title="preview"
        ref={iframRef}
        srcDoc={html}
        sandbox="allow-scripts"
      />
    </>
  );
};

export default Preview;
