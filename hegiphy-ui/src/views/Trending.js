import React, { useEffect, useState } from 'react';
import { useAuth0 } from '../react-auth0-spa';
import GiphyImageGrid from '../components/GiphyImageGrid';
import config from "../config.json";


const Trending = () => {
  const { getTokenSilently } = useAuth0();
  const [results, setResults] = useState({});

  useEffect(() => {
    const fetchTrending = async () => {
      const token = await getTokenSilently();

      fetch(`${config.hegiphyApiBaseUri}/giphy/trending?c=9`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setResults(data);
        })
        .catch(console.log);
    };

    fetchTrending();

    const timer = setInterval(fetchTrending, 30000);
    return () => clearInterval(timer);
  }, [getTokenSilently]);

  return (
    <>
      <h1>Trending Giphy Images</h1>
      <GiphyImageGrid json={results} />
    </>
  );
};

export default Trending;
