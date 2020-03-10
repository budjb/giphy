import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as fasHeart, faTag, faTimes, faLink } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import Popup from 'reactjs-popup';
import { useFavorites } from "./FavoritesRegistry";
import './GiphyImage.css';

const AddContent = ({ id }) => {
  const { addTag } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  let inputBox = null;

  const handler = event => {
    event.preventDefault();
    addTag(id, newTagName);
    setIsAdding(false);
  };

  useEffect(() => {
    if (isAdding) {
      inputBox.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdding]);

  if (isAdding) {
    return (
      <form onSubmit={handler}>
        <div className="addTagContainer">
          <input
            type="text"
            name="tagName"
            ref={input => {
              inputBox = input;
            }}
            onChange={event => setNewTagName(event.target.value)}
            placeholder="Enter new tag name..."
          />
          <button className="addNewTag" />
        </div>
      </form>
    );
  } 
    return (
      <div className="addTagContainer">
        <button className="openNewTag" onClick={() => setIsAdding(true)}>
          + Add New Tag
        </button>
      </div>
    );
  
};

const GiphyTagPill = ({ id, tag }) => {
  const { removeTag } = useFavorites();

  return (
    <span className="tag-pill">
      {tag}
      <span className="tag-pill-remove" onClick={() => removeTag(id, tag)}>
        <FontAwesomeIcon icon={faTimes} />
      </span>
    </span>
  );
};

const GiphyTagModal = ({ id, tags = [] }) => {
  return (
    <Popup
      contentStyle={{ width: '400px' }}
      trigger={(
        <span className="tag">
          <FontAwesomeIcon icon={faTag} />
        </span>
      )}
      on="click"
      modal
    >
      {close => (
        <div className="image-details-modal">
          <button onClick={close} className="close-modal">
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div>
            <h3>Tags</h3>
            <div>
              {tags.map((it, i) => {
                return <GiphyTagPill key={i} id={id} tag={it} />;
              })}
            </div>
            <div>
              <AddContent id={id} />
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
};

const GiphyImageModal = ({ image }) => {
  const thumbnail = image.images.fixed_width;
  const original = image.images.original;

  return (
    <Popup
      contentStyle={{ width: 'auto' }}
      trigger={(
        <img className="thumbnail" src={thumbnail.url} width={thumbnail.width} height={thumbnail.height} alt={image.title} />
      )}
      on="click"
      modal
    >
      {close => (
        <div className="image-full" style={{width: original.width + 'px'}}>
          <button onClick={close} className="close-modal">
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <img src={original.url} width={original.width} height={original.height} alt={image.title}/>
          <p><FontAwesomeIcon icon={faLink}/> <a href={image.url}>{image.title}</a></p>
        </div>
      )}
    </Popup>
  );
}

const GiphyImage = props => {
  const { isFavorite, addFavorite, removeFavorite, getFavorite } = useFavorites();
  const [busy, setBusy] = useState(false);
  const {image} = props;
  const thumbnail = image.images.fixed_width;
  const {id} = image;

  const toggleFavorite = async () => {
    if (busy) {
      return;
    }

    if (isFavorite(id)) {
      setBusy(true);
      await removeFavorite(id);
      setBusy(false);
    } else {
      setBusy(true);
      await addFavorite(id);
      setBusy(false);
    }
  };

  return (
    <div className="giphy-image" style={{ width: `${thumbnail.width}px` }}>
      <GiphyImageModal image={image}/>
      <div className="giphy-actions">
        {isFavorite(id) && <GiphyTagModal id={image.id} tags={getFavorite(image.id).tags} />}
        <span className="fav" onClick={toggleFavorite}>
          <FontAwesomeIcon icon={isFavorite(id) ? fasHeart : farHeart} />
        </span>
      </div>
    </div>
  );
};

export default GiphyImage;
