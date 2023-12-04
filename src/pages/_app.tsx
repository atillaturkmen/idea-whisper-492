import type { AppProps } from 'next/app';
import Head from 'next/head';
import "../styles/globals.css"
import { ToastContainer } from 'react-toastify';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Idea Whisper</title>
                <meta name="description" content="Discuss Anonymously" />
            </Head>
            <ToastContainer />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
