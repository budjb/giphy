import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useAuth0 } from '../react-auth0-spa';
import { Form, InputGroup, Button } from 'react-bootstrap';

import './NavBar.scss';

const SearchBar = () => {
  const history = useHistory();
  const location = useLocation();

  let searchRef;

  const params = new URLSearchParams(location.search);
  const q = params.get('q');

  const redirectSearch = event => {
    event.preventDefault();

    const term = searchRef.value;

    if (!term) {
      history.push('/');
    } else {
      history.push({
        pathname: '/search',
        search: new URLSearchParams({ q: term }).toString(),
      });
    }
  };

  return (
    <Form onSubmit={event => redirectSearch(event)}>
      <InputGroup>
        <Form.Control
          placeholder="Search Giphy..."
          defaultValue={q}
          ref={ref => (searchRef = ref)}
          type="text"
          className="search"
        />
        <InputGroup.Append>
          <Button variant="secondary">
            <FontAwesomeIcon icon={faArrowRight} />
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  );
};

const NavBar = () => {
  const { logout } = useAuth0();

  return (
    <header className="main-nav d-flex flex-row align-items-center">
      <div className="flex-grow-1">
        <SearchBar />
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
