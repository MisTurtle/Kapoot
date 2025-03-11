import { AppProps } from 'next/app';
import '../styles/globals.scss';
import { PopupProvider } from '@contexts/PopupContext';

function KapootApp({ Component, pageProps }: AppProps) {
    return (
        <PopupProvider>
            <Component {...pageProps} />
        </PopupProvider>
    );
}

export default KapootApp;
