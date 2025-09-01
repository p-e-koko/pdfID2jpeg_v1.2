import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>PDF to JPG Converter</title>
        <meta name="description" content="Convert the first page of your PDF files to high-quality JPG images" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #1a1d29 0%, #2d3748 100%);
          min-height: 100vh;
          padding: 20px;
          color: #e2e8f0;
          margin: 0;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
