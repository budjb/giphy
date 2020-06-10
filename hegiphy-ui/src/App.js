import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { useAuth0 } from './react-auth0-spa';
import history from './utils/history';
import { Container } from 'react-bootstrap';

import { FavoritesRegistry } from './components/FavoritesRegistry';

import NavBar from './components/NavBar';
import Trending from './views/Trending';
import Loading from './components/Loading';
import Search from './views/Search';
import Favorites from './views/Favorites';

import './App.scss';

const App = () => {
  const { loading, isAuthenticated, loginWithRedirect } = useAuth0();

  if (loading) {
    return (
      <center>
        <Loading />
      </center>
    );
  }
  if (!isAuthenticated) {
    loginWithRedirect();
  } else {
    return (
      <FavoritesRegistry>
        <Router history={history}>
          <NavBar />
          <Container className="content">
            <Switch>
              <Route path="/favorites" component={Favorites} />
              <Route path="/search" component={Search} />
              <Route path="/" exact component={Trending} />
            </Switch>
          </Container>
        </Router>
      </FavoritesRegistry>
    );
  }
};

export default App;
