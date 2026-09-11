import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchVegetarianRecipes } from '../services/api.js';
import { translateRecipes, translateText } from '../services/translation.js';
import { SUPPORTED_LANGUAGES } from '../i18n.js';
import { RecipeContext } from './RecipeContext.js';

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('veggiedelight-language');
  return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : 'it';
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState(getInitialLanguage);
  const queryRef = useRef('');
  const requestControllerRef = useRef(null);

  const loadRecipes = useCallback(async (searchQuery = '') => {
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const translatedQuery = language === 'it'
        ? await translateText(searchQuery, 'en')
        : searchQuery;
      const data = await fetchVegetarianRecipes(translatedQuery, 0, { signal: controller.signal });
      const translatedRecipes = await translateRecipes(data.results, language);

      if (!controller.signal.aborted) {
        setRecipes(translatedRecipes);
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
    localStorage.setItem('veggiedelight-language', language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <RecipeContext.Provider value={{
      recipes,
      loading,
      error,
      query,
      setQuery: updateQuery,
      loadRecipes,
      language,
      setLanguage,
      toggleLanguage,
    }}>
      {children}
    </RecipeContext.Provider>
  );
};
