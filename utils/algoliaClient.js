// utils/algoliaClient.js
import algoliasearch from 'algoliasearch/lite';

export const searchClient = algoliasearch(
  process.env.TU_APPLICATION_ID,  // ← Tu Application ID de Algolia
  process.env.TU_SEARCH_API_KEY   // ← Tu Search-Only API Key de Algolia
);