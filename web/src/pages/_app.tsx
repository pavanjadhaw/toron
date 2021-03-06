import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';
import type { AppProps /*, AppContext */ } from 'next/app';

import theme from '../theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  );
}

export default MyApp;
