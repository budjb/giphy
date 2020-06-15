import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Modal, InputGroup, Button, Form } from 'react-bootstrap';
import { useFavorites } from './FavoritesRegistry';
import { useImageGridContext } from './GiphyImageGrid';

export const TagsModal = () => {
  const favoritesContext = useFavorites();
  const imageGridContext = useImageGridContext();

  const [showAdd, setShowAdd] = useState(false);

  if (!imageGridContext.showTagsModal || !imageGridContext.activeImage) {
    return '';
  }

  let addRef;
  const image = imageGridContext.activeImage;

  const handleAddTag = event => {
    event.preventDefault();

    if (addRef.value) {
      favoritesContext.addTag(image.id, addRef.value);
    }

    setShowAdd(false);
  };

  const favorite = favoritesContext.getFavorite(image.id);

  if (!favorite) {
    return '';
  }

  const tags = favorite.tags.length ? (
    favorite.tags.map(it => (
      <span className="giphy-tag-pill">
        {it}
        <span
          className="giphy-tag-pill-remove rounded-circle bg-danger text-center text-white"
          onClick={() => favoritesContext.removeTag(image.id, it)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </span>
      </span>
    ))
  ) : (
    <center>
      <em>This Giphy image doesn't have any tags yet!</em>
    </center>
  );

  return (
    <Modal show onHide={imageGridContext.closeTagsModal}>
      <Modal.Header closeButton>
        <Modal.Title>Tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {tags}
        {showAdd && (
          <Form onSubmit={handleAddTag} className="mt-2">
            <InputGroup>
              <Form.Control placeholder="Tag name..." type="text" ref={ref => (addRef = ref)} />
              <InputGroup.Append>
                <Button variant="secondary" type="submit">
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={imageGridContext.closeTagsModal}>
          Close
        </Button>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          Add Tag
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
