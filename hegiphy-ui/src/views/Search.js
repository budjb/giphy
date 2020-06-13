import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { useAuth0 } from '../react-auth0-spa';
import GiphyImageGrid from '../components/GiphyImageGrid';
import Pagination from '../components/Pagination';
import config from '../config';

const Search = props => {
  const { getTokenSilently } = useAuth0();
  const [results, setResults] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const pageLimit = 9;

  const parseResults = data => {
    setResults(data);
    const { pagination } = data;
    setTotalPages(Math.ceil(pagination.total_count / pageLimit));
  };

  const getParams = () => {
    return new URLSearchParams(props.location.search);
  };

  const parseQuery = () => {
    return getParams().get('q');
  };

  const parsePage = () => {
    return parseInt(getParams().get('p')) || 0;
  };

  const changePage = ({ selected }) => {
    props.history.push(`/search?q=${parseQuery()}&p=${selected}`);
  };

  useEffect(() => {
    const fetchResults = async () => {
      const token = await getTokenSilently();

      const query = parseQuery();
      const page = parsePage();

      const offset = Math.max(page, 0) * pageLimit;

      fetch(`${config.hegiphyApiBaseUri}/giphy/query?q=${query}&offset=${offset}&limit=${pageLimit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP status${res.status}`);
          }
          return res;
        })
        .then(res => res.json())
        .then(data => {
          parseResults(data);
          setIsLoading(false);
        })
        .catch(console.log);
    };

    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  return (
    <>
      <h1 className="text-center">Search Results for "{parseQuery()}"</h1>
      <GiphyImageGrid json={results} />
      <Pagination display={!isLoading} currentPage={parsePage()} totalPages={totalPages} handler={changePage} />
    </>
  );
};

export default withRouter(Search);
