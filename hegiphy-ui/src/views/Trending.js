import React, { useEffect, useState } from 'react';
import { useAuth0 } from '../react-auth0-spa';
import GiphyImageGrid from '../components/GiphyImageGrid';
import config from '../config';

const Trending = () => {
  const { getTokenSilently } = useAuth0();
  const [results, setResults] = useState({});

  useEffect(() => {
    const fetchTrending = async () => {
      const token = await getTokenSilently();

      fetch(`${config.hegiphyApiBaseUri}/giphy/trending?limit=9`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setResults(data);
        })
        .catch(console.error);
    };

    fetchTrending();

    const timer = setInterval(fetchTrending, 30000);
    return () => clearInterval(timer);
  }, [getTokenSilently]);

  return (
    <>
      <h1 className="text-center">Trending Giphy Images</h1>
      <GiphyImageGrid json={results} />
    </>
  );
};

export default Trending;
