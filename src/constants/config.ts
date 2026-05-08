// Central config — all environment-specific values live here.
// In production, these would come from react-native-config (.env files)
// so the same codebase works across dev / staging / production without
// any code changes — just swap the .env file at build time.
const Config = {
  GRAPHQL_URL: 'https://graphqlzero.almansi.me/api',
};

export default Config;
