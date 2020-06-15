import React, { useState, useCallback, useContext, createContext } from 'react';
import { Container, Col, Image, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar as faStarSolid, faTags, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons';
import { useFavorites } from './FavoritesRegistry';
import { ShareModal } from './ShareModal';
import { TagsModal } from './TagsModal';
import { RotateLoader } from 'react-spinners';

const ImageGridContext = createContext();
export const useImageGridContext = () => useContext(ImageGridContext);

const ImageModal = () => {
  const favoritesContext = useFavorites();
  const imageGridContext = useImageGridContext();

  const showClass = imageGridContext.showExpandedModal ? 'show' : '';
  const image = imageGridContext.expandedImage;
  const isFavorite = favoritesContext.isFavorite(image);

  const handleKeyDown = useCallback(
    event => {
      if (event.keyCode === 27) {
        imageGridContext.closeImage();
      }
    },
    [imageGridContext]
  );

  if (imageGridContext.showExpandedModal) {
    window.addEventListener('keydown', handleKeyDown);
  } else {
    window.removeEventListener('keydown', handleKeyDown);
  }

  // Since we're relying on CSS transforms to render a scroll-into-view effect,
  // the background MUST be rendered (and hidden out of view) even when the modal
  // should not be shown for the effect to function.
  return (
    <div className={`image-modal d-flex flex-column ${showClass}`}>
      {image && (
        <>
          <div className="d-flex flex-row align-items-center p-2">
            <div className="d-block flex-grow-1 flex-shrink-0">
              <span className="p-2 cursor-pointer" onClick={imageGridContext.closeImage}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </span>
            </div>
            <div>
              <span className="p-1 cursor-pointer text-white" onClick={() => imageGridContext.openShareModal(image)}>
                <FontAwesomeIcon icon={faShareAlt} />
              </span>
              {isFavorite && (
                <span className="p-1 cursor-pointer text-white" onClick={() => imageGridContext.openTagsModal(image)}>
                  <FontAwesomeIcon icon={faTags} />
                </span>
              )}
              <span className="p-1 cursor-pointer text-white" onClick={() => imageGridContext.toggleFavorite(image)}>
                <FontAwesomeIcon icon={isFavorite ? faStarSolid : faStarOutline} />
              </span>
            </div>
          </div>
          <img src={image.images.original.url} alt={image.title} className="flex-grow-1 giphy-image" />
        </>
      )}
    </div>
  );
};

const GiphyImage = ({ image }) => {
  const favoritesContext = useFavorites();
  const imageGridContext = useImageGridContext();

  const thumbnail = image.images.downsized_large;
  const isFavorite = favoritesContext.isFavorite(image);

  return (
    <Col className="thumbnail py-1 px-md-1">
      <Image src={thumbnail.url} alt={image.title} onClick={() => imageGridContext.expandImage(image)} />
      <div class="actions">
        <span className="p-1 cursor-pointer text-white" onClick={() => imageGridContext.openShareModal(image)}>
          <FontAwesomeIcon icon={faShareAlt} />
        </span>
        {isFavorite && (
          <span className="p-1 cursor-pointer text-white" onClick={() => imageGridContext.openTagsModal(image)}>
            <FontAwesomeIcon icon={faTags} />
          </span>
        )}
        <span className="p-1 cursor-pointer text-white" onClick={() => imageGridContext.toggleFavorite(image)}>
          <FontAwesomeIcon icon={isFavorite ? faStarSolid : faStarOutline} />
        </span>
      </div>
    </Col>
  );
};

export default ({ json }) => {
  const [showExpandedModal, setShowExpandedModal] = useState(false);
  const [expandedImage, setExpandedImage] = useState();

  const [isBusy, setIsBusy] = useState(false);

  const [activeImage, setActiveImage] = useState();
  const [showShare, setShowShare] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);

  const favoritesContext = useFavorites();

  const expandImage = image => {
    setExpandedImage(image);
    setShowExpandedModal(true);
    document.body.classList.toggle('image-modal-shown', true);
  };

  const closeImage = () => {
    setExpandedImage(null);
    setShowExpandedModal(false);
    document.body.classList.toggle('image-modal-shown', false);
  };

  const openShareModal = image => {
    setActiveImage(image);
    setShowShare(true);
  };

  const closeShareModal = () => {
    setActiveImage(undefined);
    setShowShare(false);
  };

  const openTagsModal = image => {
    setActiveImage(image);
    setShowTagsModal(true);
  };

  const closeTagsModal = () => {
    setActiveImage(undefined);
    setShowTagsModal(false);
  };

  const toggleFavorite = async image => {
    if (isBusy) {
      return;
    }

    setIsBusy(true);

    try {
      if (favoritesContext.isFavorite(image)) {
        await favoritesContext.removeFavorite(image.id);
      } else {
        await favoritesContext.addFavorite(image.id);
      }
    } catch (err) {
      console.error(err); // TODO: display to user somehow
    } finally {
      setIsBusy(false);
    }
  };

  const { data } = json;

  if (favoritesContext.loading || json.data === undefined) {
    return (
      <center>
        <RotateLoader />
      </center>
    );
  } else {
    return (
      <ImageGridContext.Provider
        value={{
          showExpandedModal,
          expandImage,
          closeImage,

          openShareModal,
          closeShareModal,

          showTagsModal,
          openTagsModal,
          closeTagsModal,

          activeImage,
          expandedImage,

          toggleFavorite,
        }}
      >
        <div className="image-grid">
          {activeImage && showShare && (
            <ShareModal show close={closeShareModal} url={activeImage.images.original.url} title={activeImage.title} />
          )}

          <TagsModal />
          <ImageModal />

          <Container fluid={true}>
            <Row noGutters xs={1} md={3} lg={3}>
              {data.map(it => {
                return <GiphyImage key={it.id} image={it} />;
              })}
            </Row>
          </Container>
        </div>
      </ImageGridContext.Provider>
    );
  }
};
