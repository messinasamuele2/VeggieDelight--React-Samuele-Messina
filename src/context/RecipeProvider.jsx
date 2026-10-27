import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchVegetarianRecipes } from '../services/api.js';
import { translateRecipes, translateText } from '../services/translation.js';
import { SUPPORTED_LANGUAGES } from '../i18n.js';
import { RecipeContext } from './RecipeContext.js';

export const MAX_FETCH_ATTEMPTS = 5;
const RESULTS_PER_ATTEMPT = 12;

const getInitialLanguage = () => {
  let savedLanguage = null;
  try {
    savedLanguage = localStorage.getItem('veggiedelight-language');
  } catch {
    // Storage può essere disabilitato dalle impostazioni del browser.
  }
  return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : 'it';
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [language, setLanguage] = useState(getInitialLanguage);
  const queryRef = useRef('');
  const offsetRef = useRef(0);
  const requestControllerRef = useRef(null);

  const loadRecipes = useCallback(async (searchQuery = '', { append = false } = {}) => {
    const safeQuery = String(searchQuery).trim().slice(0, 100);
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    if (!append) offsetRef.current = 0;
    const startOffset = append ? offsetRef.current : 0;
    const collectedRecipes = [];
    let nextOffset = startOffset;
    let moreResults = false;

    if (!append) {
      setRecipes([]);
      setHasMore(false);
    }
    setLoading(true);
    setError(null);

    try {
      const translatedQuery = language === 'it'
        ? await translateText(safeQuery, 'en')
        : safeQuery;
      for (
        let attempt = 0;
        attempt < MAX_FETCH_ATTEMPTS && collectedRecipes.length < RESULTS_PER_ATTEMPT;
        attempt += 1
      ) {
        const data = await fetchVegetarianRecipes(translatedQuery, {
          signal: controller.signal,
          offset: nextOffset,
          limit: RESULTS_PER_ATTEMPT,
          queryVariants: [safeQuery],
        });
        const translatedRecipes = await translateRecipes(data.results, language);
        collectedRecipes.push(...translatedRecipes);
        nextOffset = data.nextOffset;
        moreResults = data.hasMore;

        if (!data.hasMore || data.results.length === 0) break;
      }

      if (!controller.signal.aborted) {
        setRecipes((currentRecipes) => append
          ? [...currentRecipes, ...collectedRecipes]
          : collectedRecipes);
        offsetRef.current = nextOffset;
        setHasMore(moreResults);
      }
    } catch (requestError) {
      if (requestError.name !== 'CanceledError' && requestError.name !== 'AbortError') {
        setError(language === 'it'
          ? 'Impossibile caricare le ricette. Riprova più tardi.'
          : 'Failed to fetch recipes. Please try again later.');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [language]);

  const loadMore = useCallback(() => loadRecipes(queryRef.current, { append: true }), [loadRecipes]);

  const updateQuery = useCallback((value) => {
    queryRef.current = value;
    setQuery(value);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((currentLanguage) => currentLanguage === 'it' ? 'en' : 'it');
  }, []);

  useEffect(() => {
    loadRecipes(queryRef.current);
    return () => requestControllerRef.current?.abort();
  }, [loadRecipes]);

  useEffect(() => {
    try {
      localStorage.setItem('veggiedelight-language', language);
    } catch {
      // L'app resta utilizzabile anche senza persistenza locale.
    }
    document.documentElement.lang = language;
  }, [language]);

  return (
    <RecipeContext.Provider value={{
      recipes,
      loading,
      error,
      hasMore,
      query,
      setQuery: updateQuery,
      loadRecipes,
      loadMore,
      language,
      toggleLanguage,
    }}>
      {children}
    </RecipeContext.Provider>
  );
};
