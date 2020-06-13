import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useAuth0 } from '../react-auth0-spa';
import { Form, InputGroup, Button, Navbar, Nav } from 'react-bootstrap';

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
    <div className="d-block">
      <Form onSubmit={event => redirectSearch(event)}>
        <InputGroup>
          <Form.Control
            placeholder="Search Giphy..."
            defaultValue={q}
            ref={ref => (searchRef = ref)}
            type="text"
          />
          <InputGroup.Append>
            <Button variant="secondary">
              <FontAwesomeIcon icon={faArrowRight} />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Form>
    </div>
  );
};

export default () => {
  const { logout } = useAuth0();

  return (
    <header className="main-nav">
      <Navbar expand="sm" variant="dark">
        <Navbar.Brand className="d-inline-block d-sm-none">HeGiphy</Navbar.Brand>
        <Navbar.Toggle/>
        <Navbar.Collapse className="pt-2 pt-sm-0">
          <SearchBar />
          <Nav className="justify-content-end flex-sm-grow-1">
            <Nav.Item as={Link} to="/" className="px-sm-2">Trending</Nav.Item>
            <Nav.Item as={Link} to="/favorites" className="px-sm-2">Favorites</Nav.Item>
            <Nav.Item className="px-sm-2 signout" onClick={logout}>Sign Out <FontAwesomeIcon icon={faSignOutAlt} /></Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};
