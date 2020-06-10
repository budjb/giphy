import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as fasHeart, faTag, faTimes, faLink } from '@fortawesome/free-solid-svg-icons';
import { useFavorites } from './FavoritesRegistry';
import { Modal, Image, Col } from 'react-bootstrap';
import './GiphyImage.scss';

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

const GiphyImage = ({ image }) => {
  const [show, setShow] = useState(false);

  const thumbnail = image.images.downsized_large;
  const original = image.images.original;

  return (
    <>
      <Image
        fluid
        src={thumbnail.url}
        style={{ maxWidth: '400px' }}
        alt={image.title}
        thumbnail
        rounded
        className="shadow"
        onClick={() => setShow(true)}
      />
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          {image.title}{' '}
          <small className="ml-1 align-middle">
            <a href={image.url} target="_blank">
              <FontAwesomeIcon icon={faLink} />
            </a>
          </small>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image
            fluid
            src={original.url}
            width={original.width}
            height={original.height}
            alt={image.title}
            className="shadow"
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

const TagPills = ({ tags, id }) => {
  const { removeTag } = useFavorites();

  return tags.map((it, i) => {
    return (
      <span key={i} className="giphy-tag-pill py-1 px-2 border rounded-pill bg-light mx-1">
        {it}
        <span
          className="giphy-tag-pill-remove rounded-circle bg-danger text-center text-white"
          onClick={() => removeTag(id, it)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </span>
      </span>
    );
  });
};

const TagIcon = ({ isFavorite, id, tags }) => {
  const [show, setShow] = useState(false);

  if (!isFavorite) {
    return <></>;
  }

  return (
    <>
      <span className="giphy-image-tag" onClick={() => setShow(true)}>
        <FontAwesomeIcon icon={faTag} />
      </span>

      <Modal size="sm" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>Tags</Modal.Header>
        <Modal.Body>
          <TagPills id={id} tags={tags} />
          <AddContent id={id} />
        </Modal.Body>
      </Modal>
    </>
  );
};

const FavIcon = ({ isFavorite, handler }) => {
  let className = 'giphy-image-fav';

  if (isFavorite) {
    className += ' active';
  }

  return (
    <span className={className} onClick={handler}>
      <FontAwesomeIcon icon={fasHeart} />
    </span>
  );
};

const ImageToolbar = ({ children }) => {
  return <div className="text-right">{children}</div>;
};
