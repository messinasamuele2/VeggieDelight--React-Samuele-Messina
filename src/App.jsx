import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RecipeProvider } from './context/RecipeProvider.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import RecipeDetails from './pages/RecipeDetails.jsx';

function App() {
  return (
    <RecipeProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipe/:id" element={<RecipeDetails />} />
            </Routes>
          </main>
        </div>
      </Router>
    </RecipeProvider>
  );
}

export default App;
