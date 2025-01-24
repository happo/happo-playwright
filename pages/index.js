import React, { useEffect, useRef } from 'react';

function CanvasImage({ responsive }) {
  const ref = useRef();
  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    ctx.moveTo(0, 0);
    ctx.lineTo(200, 100);
    ctx.stroke();
    ctx.font = '30px Arial';
    ctx.rotate(0.25);
    ctx.fillText('I am a canvas', 20, 50);
  });

  return (
    <canvas
      className="canvas"
      data-test="untainted-canvas"
      style={{
        padding: 20,
        width: responsive ? 'calc(100% - 40px)' : undefined,
      }}
      ref={ref}
      width={responsive ? undefined : '200'}
      height={responsive ? undefined : '100'}
    />
  );
}

export default function IndexPage() {
  return (
    <main>
      <h1>Hello world</h1>
      <a href="/goodbye">goodbye</a>
      <CanvasImage />

      <div style={{ width: 200 }}>
        I am 200px wide.
        <div style={{ width: '100%' }} id="stretch-to-parent">
          I stretch to 100% width of my parent, which is 200px wide.
        </div>
      </div>

      <style>{`
        h1 {
          color: red;
          font-weight: bold;
          font-family: sans-serif;
        }
      `}</style>
    </main>
  );
}
