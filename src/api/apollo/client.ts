import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// HttpLink defines WHERE Apollo sends GraphQL requests.
// Every query/mutation goes to this single endpoint as a POST request.
// GraphQL uses one endpoint (unlike REST which has many routes).
const httpLink = new HttpLink({
  uri: 'https://graphqlzero.almansi.me/api',
});

// InMemoryCache is Apollo's built-in client-side cache.
// It normalizes data by __typename + id, so:
//   - Two queries that return the same Photo share one cached entry
//   - Updating a Photo in one place automatically updates all views
const cache = new InMemoryCache();

// ApolloClient is the central manager.
// It handles: sending requests, caching responses, error handling,
// and exposing hooks like useQuery/useMutation to React components.
const client = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: {
    watchQuery: {
      // cache-and-network: show cached data immediately (fast UX),
      // then refetch from network in background and update UI silently.
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default client;
