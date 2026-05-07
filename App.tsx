import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
// Apollo v4: ApolloProvider and React hooks live in '@apollo/client/react'
// Core client (ApolloClient, InMemoryCache) lives in '@apollo/client'
import { ApolloProvider } from '@apollo/client/react';
import { NavigationContainer } from '@react-navigation/native';

import { store } from './src/redux/store';
import client from './src/api/apollo/client';
import RootNavigator from './src/navigation/RootNavigator';

// App.tsx is the composition root — it ONLY wires providers together.
// Zero business logic. Zero UI logic. Just providers wrapping the navigator.
//
// Provider order matters:
//   Redux Provider → outermost, available to everything including Apollo
//   ApolloProvider → wraps navigation so screens can use useQuery
//   NavigationContainer → must wrap all navigation, outermost nav context
//   RootNavigator → the actual screen tree
const App = () => {
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <RootNavigator />
        </NavigationContainer>
      </ApolloProvider>
    </Provider>
  );
};

export default App;
