import React from 'react';

export default function IndexPage() {
  return (
    <main>
      <h1>Hello world</h1>
      <a href="/goodbye">goodbye</a>

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
