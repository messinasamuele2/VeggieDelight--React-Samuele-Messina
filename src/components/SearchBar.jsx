import React, { useContext } from 'react';
import { RecipeContext } from '../context/RecipeContext.js';
import { getMessages } from '../i18n.js';
import './SearchBar.css';

const SearchBar = () => {
  const { query, setQuery, loadRecipes, language } = useContext(RecipeContext);
  const copy = getMessages(language);

  const handleSubmit = (e) => {
    e.preventDefault();
    loadRecipes(query);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          id="recipe-search"
          aria-label={copy.searchLabel}
          placeholder={copy.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          {copy.search}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
