import { AppProps } from 'next/app';
import '../styles/globals.scss';

function KapootApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default KapootApp;
