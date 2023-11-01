import type { AppProps } from 'next/app';
import Head from 'next/head';
import "../styles/globals.css"

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Idea Whisper</title>
                <meta name="description" content="Discuss Anonymously" />
            </Head>

            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
