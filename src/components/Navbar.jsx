import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { RecipeContext } from '../context/RecipeContext.js';
import { getMessages } from '../i18n.js';
import './Navbar.css';

const Navbar = () => {
  const { language, toggleLanguage } = useContext(RecipeContext);
  const copy = getMessages(language);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          🌿 VeggieDelight
        </Link>
        <nav className="nav-links">
          <Link to="/">{copy.home}</Link>
          <a href="#about">{copy.about}</a>
          <button
            type="button"
            className="language-toggle"
            onClick={toggleLanguage}
            aria-label={language === 'it' ? copy.switchToEnglish : copy.switchToItalian}
          >
            {language === 'it' ? 'EN' : 'IT'}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
