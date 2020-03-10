import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import GiphyImageGrid from '../components/GiphyImageGrid';
import { useFavorites } from '../components/FavoritesRegistry';
import { useAuth0 } from '../react-auth0-spa';
import Pagination from '../components/Pagination';
import { Notice } from '../components/AlertBox';
import Loading from '../components/Loading';
import config from "../config.json";
import './Favorites.css';

const GiphyTagPill = ({ tag, history, isActive, hook }) => {
  const handle = () => {
    if (!isActive) {
      history.push(`/favorites?tag=${tag}`);
      hook(tag);
    }
    else {
      history.push('/favorites');
      hook(undefined);
    }
  };

  const activeStyle = isActive ? 'active' : '';
  return (
    <span className={`tag-pill ${activeStyle}`} onClick={handle}>
      {tag}
    </span>
  );
};

const GiphyTagPillRouter = withRouter(GiphyTagPill);

const Favorites = props => {
  const { getTokenSilently } = useAuth0();
  const { favoritesData, getAllTags, getFavoritesByTag } = useFavorites();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tagFilter, setTagFilter] = useState();

  const pageLimit = 9;

  const getParams = () => {
    return new URLSearchParams(props.location.search);
  };

  const parsePage = () => {
    return parseInt(getParams().get('p')) || 0;
  };

  const parseTag = () => {
    return getParams().get('tag');
  };

  const changePage = ({ selected }) => {
    props.history.push(`/favorites?p=${selected}`);
  };

  useEffect(() => {
    const fetchResults = async () => {
      const token = await getTokenSilently();
      const page = parsePage();
      const offset = Math.max(page, 0) * pageLimit;

      setTagFilter(parseTag());
      const data = tagFilter ? getFavoritesByTag(tagFilter) : favoritesData;
      setTotalPages(Math.ceil(data.length / pageLimit));

      const favorites = data.slice(offset, offset + pageLimit);

      if (page > 0 && favorites.length === 0) {
        changePage({ selected: page - 1 });
        return;
      }

      if (favorites.length === 0 && tagFilter) {
        props.history.push('/favorites');
        return;
      }

      if (favorites.length === 0) {
        setResults([]);
        setIsLoading(false);
      } else {
        fetch(`${config.hegiphyApiBaseUri}/giphy/gifs?ids=${favorites.map(it => it.giphyId).join(',')}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(res => res.json())
          .then(data => {
            setResults(data);
            setIsLoading(false);
          })
          .catch(console.log);
      }
    };

    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, favoritesData, tagFilter]);

  if (isLoading) {
    return <Loading />;
  } if (results.length === 0) {
    return (
      <>
        <h1>Favorite Giphy Images</h1>
        <Notice>You have no favorite Giphy images.</Notice>
      </>
    );
  } 
    return (
      <>
        <h1>Favorite Giphy Images</h1>
        <div className="tags-container">
          {getAllTags().map(it => (
            <GiphyTagPillRouter hook={setTagFilter} tag={it} isActive={it === tagFilter} />
          ))}
        </div>
        <GiphyImageGrid json={results} />
        {totalPages > 1 && (
          <Pagination
            display={!isLoading}
            currentPage={parsePage()}
            totalPages={totalPages}
            handler={changePage}
          />
        )}
      </>
    );
  
};

export default withRouter(Favorites);
