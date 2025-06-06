// utils/algoliaClient.js
import algoliasearch from 'algoliasearch/lite';

export const searchClient = algoliasearch(
  TU_APPLICATION_ID,  // ← Tu Application ID de Algolia
  TU_SEARCH_API_KEY   // ← Tu Search-Only API Key de Algolia
);