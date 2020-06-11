import React, { useEffect, useState } from 'react';
import { useAuth0 } from '../react-auth0-spa';
import config from "../config.json";

export const FavoritesContext = React.createContext();
export const useFavorites = () => React.useContext(FavoritesContext);

export const FavoritesRegistry = ({ children }) => {
  const { getTokenSilently } = useAuth0();
  const [data, setData] = useState([]);
  const [stale, setStale] = useState(true);

  const fetchFavorites = async () => {
    const token = await getTokenSilently();

    fetch(`${config.hegiphyApiBaseUri}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        setData(res);
        return res;
      })
      .then(() => setStale(false))
      .catch(console.log);
  };

  useEffect(() => {
    if (stale) {
      fetchFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stale]);

  const isFavorite = id => {
    return getFavorite(id) !== undefined;
  };

  const getFavorite = id => {
    return data.find(it => it.id ===id);
  };

  const addFavorite = async id => {
    const token = await getTokenSilently();

    fetch(`${config.hegiphyApiBaseUri}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        id
      }),
    })
      .then(() => setStale(true))
      .catch(console.log);
  };

  const addTag = async (id, tag) => {
    const token = await getTokenSilently();

    fetch(`${config.hegiphyApiBaseUri}/favorites/${id}/tags/${tag}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
    })
      .then(() => setStale(true))
      .catch(console.log);
  };

  const removeTag = async (id, tag) => {
    const token = await getTokenSilently();

    fetch(`${config.hegiphyApiBaseUri}/favorites/${id}/tags/${tag}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'DELETE',
    })
      .then(() => setStale(true))
      .catch(console.log);
  };

  const getAllTags = () => {
    const tags = new Set();

    data.forEach(fav => {
      fav.tags.forEach(tag => {
        tags.add(tag);
      });
    });

    return [...tags];
  };

  const getFavoritesByTag = tag => {
    return data.filter(it => it.tags.includes(tag));
  };

  const removeFavorite = async id => {
    const token = await getTokenSilently();

    fetch(`${config.hegiphyApiBaseUri}/favorites/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'DELETE',
    })
      .then(() => setStale(true))
      .catch(console.log);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoritesData: data,
        isFavorite,
        addFavorite,
        removeFavorite,
        addTag,
        removeTag,
        getFavorite,
        getAllTags,
        getFavoritesByTag,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
