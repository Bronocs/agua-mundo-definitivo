import * as algoliasearch from 'algoliasearch/lite';

export const searchClient = algoliasearch.default(
  process.env.TU_APPLICATION_ID,
  process.env.TU_SEARCH_API_KEY
);

export const productosIndex = searchClient.initIndex(process.env.ALGOLIA_INDEX_NAME);