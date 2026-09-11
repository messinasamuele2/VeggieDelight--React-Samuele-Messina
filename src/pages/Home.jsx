import React, { useContext } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import RecipeGrid from '../components/RecipeGrid.jsx';
import { RecipeContext } from '../context/RecipeContext.js';
import { getMessages } from '../i18n.js';
import './Home.css';

const Home = () => {
  const { language } = useContext(RecipeContext);
  const copy = getMessages(language);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">{copy.heroTitle}</h1>
        <p className="hero-subtitle">{copy.heroSubtitle}</p>
        <SearchBar />
      </div>
      <RecipeGrid />
      <section id="about" className="about-section" aria-labelledby="about-title">
        <h2 id="about-title">{copy.aboutTitle}</h2>
        <p>{copy.aboutText}</p>
      </section>
    </div>
  );
};

export default Home;
