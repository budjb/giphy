import React, { useState, useCallback } from 'react';
// import GiphyImage from './GiphyImage';
import { Container, Col, Image, Row, Spinner, Modal, Button, InputGroup, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar as faStarSolid, faTags, faTimes, faPlus, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons';
import { useFavorites } from './FavoritesRegistry';
import { ShareModal } from './ShareModal';

const FavoriteButton = ({ isFavorite }) => {
  if (isFavorite) {
    return <FontAwesomeIcon icon={faStarSolid} />;
  } else {
    return <FontAwesomeIcon icon={faStarOutline} />;
  }
};

const TagsModal = ({ image, show, close, favorite }) => {
  const { addTag, removeTag } = useFavorites();
  const [showAdd, setShowAdd] = useState(false);

  let addRef;

  const handleAddTag = event => {
    event.preventDefault();

    if (addRef.value) {
      addTag(image.id, addRef.value);
    }

    setShowAdd(false);
  };

  if (!favorite) {
    return '';
  }

  const tags = favorite.tags.length ? (
    favorite.tags.map(it => (
      <span className="giphy-tag-pill">
        {it}
        <span
          className="giphy-tag-pill-remove rounded-circle bg-danger text-center text-white"
          onClick={() => removeTag(image.id, it)}
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
    <Modal show={show} onHide={close}>
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
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          Add Tag
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ImageModal = ({ show, image, close }) => {
  const { addFavorite, removeFavorite, getFavorite } = useFavorites();
  const [isBusy, setIsBusy] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const showClass = show ? 'show' : '';

  const favorite = image ? getFavorite(image.id) : false;
  const isFavorite = favorite !== undefined;

  const handleKeyDown = useCallback(
    event => {
      if (event.keyCode === 27) {
        close();
      }
    },
    [close]
  );

  if (show) {
    window.addEventListener('keydown', handleKeyDown);
  } else {
    window.removeEventListener('keydown', handleKeyDown);
  }

  const toggleFavorite = useCallback(async () => {
    if (isBusy) {
      return;
    }

    setIsBusy(true);

    try {
      if (isFavorite) {
        await removeFavorite(image.id);
      } else {
        await addFavorite(image.id);
      }
    } catch (err) {
      console.error(err); // TODO: display to user somehow
    } finally {
      setIsBusy(false);
    }
  }, [image, isFavorite, isBusy, setIsBusy, addFavorite, removeFavorite]);

  return (
    <div className={`image-modal d-flex flex-column ${showClass}`}>
      { image && (
        <ShareModal show={showShare} close={() => setShowShare(false)} url={image.images.original.url} title={image.title}/>
      )}
      <div className="d-flex flex-row align-items-center p-2">
        <div className="d-block flex-grow-1 flex-shrink-0">
          <span className="p-2 cursor-pointer" onClick={close}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </span>
        </div>
        <div>
          <span className="p-1 cursor-pointer" onClick={() => setShowShare(true)}>
            <FontAwesomeIcon icon={faShareAlt}/>
          </span>
          {isFavorite && (
            <>
              <TagsModal image={image} favorite={favorite} show={showTags} close={() => setShowTags(false)} />
              <span className="p-1 cursor-pointer" style={{ color: 'white' }} onClick={() => setShowTags(true)}>
                <FontAwesomeIcon icon={faTags} />
              </span>
            </>
          )}
          <span className={`p-1 cursor-pointer ${isFavorite && 'favorite'}`} onClick={toggleFavorite}>
            <FavoriteButton isFavorite={isFavorite} />
          </span>
        </div>
      </div>
      {image && <img src={image.images.original.url} alt={image.title} className="flex-grow-1 giphy-image" />}
    </div>
  );
};

const GiphyImage = ({ image, expandImage }) => {
  const thumbnail = image.images.downsized_large;

  return (
    <Col className="thumbnail py-1 px-md-1" onClick={() => expandImage(image)}>
      <Image src={thumbnail.url} alt={image.title} />
    </Col>
  );
};

export default ({ json }) => {
  const [showModal, setShowModal] = useState(false);
  const [expandedImage, setExpandedImage] = useState();

  const showImage = image => {
    setExpandedImage(image);
    setShowModal(true);
    document.body.classList.toggle('image-modal-shown', true);
  };

  const closeImage = () => {
    setExpandedImage(null);
    setShowModal(false);
    document.body.classList.toggle('image-modal-shown', false);
  };

  if (json.data === undefined) {
    return (
      <center>
        <Spinner animation="border" role="status" className="mt-5">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </center>
    );
  }

  const { data } = json;

  return (
    <div className="image-grid">
      <ImageModal show={showModal} image={expandedImage} close={closeImage} />
      <Container fluid={true}>
        <Row noGutters xs={1} md={3} lg={3}>
          {data.map((it, i) => {
            return <GiphyImage expandImage={showImage} key={i} image={it} />;
          })}
        </Row>
      </Container>
    </div>
  );
};
