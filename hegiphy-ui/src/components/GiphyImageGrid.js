import React, { useState } from 'react';
// import GiphyImage from './GiphyImage';
import { Container, Col, Image, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons';

import './GiphyImageGrid.scss';

const ImageModal = ({ show, image, close }) => {
  const showClass = show ? 'show' : '';

  return (
    <div className={`image-modal d-flex flex-column ${showClass}`}>
      <div className="d-flex flex-row align-items-center p-2">
        <div className="d-block flex-grow-1 flex-shrink-0">
          <span className="p-2 cursor-pointer" onClick={close}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </span>
        </div>
        <div>
          <span className="p-2 cursor-pointer">
            <FontAwesomeIcon icon={faStarOutline} />
          </span>
        </div>
      </div>
      {image && <img src={image.images.original.url} alt={image.title} className="flex-grow-1 giphy-image" />}
    </div>
  );
};

const GiphyImage = ({ image, expandImage }) => {
  // const { addFavorite, removeFavorite, getFavorite } = useFavorites();
  const { id } = image;
  // const favorite = getFavorite(id);
  // const isFavorite = favorite !== undefined;
  // const tags = isFavorite && favorite.tags;

  // const toggleFavorite = async () => {
  //   if (isFavorite) {
  //     removeFavorite(id);
  //   } else {
  //     addFavorite(id);
  //   }
  // };

  const thumbnail = image.images.downsized_large;

  return (
    <Col className="thumbnail py-1 px-md-1" onClick={() => expandImage(image)}>
      <Image src={thumbnail.url} alt={image.title} />
    </Col>
  );
};

const ImageGrid = ({ json }) => {
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
    <>
      <ImageModal show={showModal} image={expandedImage} close={closeImage} />
      <Container fluid={true}>
        <Row noGutters xs={1} md={3} lg={3}>
          {data.map((it, i) => {
            return <GiphyImage expandImage={showImage} key={i} image={it} />;
          })}
        </Row>
      </Container>
    </>
  );
};

export default ImageGrid;
