import React, { useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useAuth0 } from '../react-auth0-spa';

import './NavBar.css';

const SearchBar = ({ history, location }) => {
  const [term, setTerm] = useState('');

  const redirectSearch = event => {
    event.preventDefault();
    history.push(`/search?q=${term}`);
  };

  return (
    <form onSubmit={event => redirectSearch(event)}>
      <input
        type="search"
        placeholder="Search Giphy..."
        onChange={event => setTerm(event.target.value)}
        id="nav-search"
      />
      <button type="submit" value="Submit">
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
    </form>
  );
};

const SearchBarRouter = withRouter(SearchBar);

const NavBar = () => {
  const { logout } = useAuth0();

  return (
    <header>
      <div className="stretch">
        <SearchBarRouter />
      </div>
      <div>
        <Link to="/">Trending</Link>
        <Link to="/favorites">Favorites</Link>
        <span className="logout" onClick={logout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
        </span>
      </div>
    </header>
  );
};

export default NavBar;
