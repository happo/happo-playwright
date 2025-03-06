import type { GetServerSideProps } from 'next';

export default function Csp() {
  return (
    <>
      <h1>I block scripts</h1>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-foobar' https://foo.bar`,
  );

  return {
    props: {},
  };
};
