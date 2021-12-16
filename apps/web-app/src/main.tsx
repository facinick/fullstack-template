import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/app/app';
import store from './store/store';
import { ApolloInint } from './apollo/ApolloProvider';
import { CustomThemeProvider } from './store/theme';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js', { scope: "/" }).then(function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <CustomThemeProvider>
        <ApolloInint>
          <App />
        </ApolloInint>
      </CustomThemeProvider>
    </Provider >
  </StrictMode>,
  document.getElementById('root')
);
