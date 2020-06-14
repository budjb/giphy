import React from 'react';
import { Modal, InputGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeSquare, faCopy } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare, faTwitterSquare } from '@fortawesome/free-brands-svg-icons';
import { FacebookShareButton, TwitterShareButton, EmailShareButton } from 'react-share';

import './ShareModal.scss';

export const ShareModal = ({ show, close, url, title }) => {
  if (typeof navigator !== 'undefined' && navigator.share) {
    if (show) {
      navigator
        .share({
          url,
          title,
        })
        .then(() => close())
        .catch(() => close());
    }
    return '';
  }

  const copyUrlToClipboard = () => {
    var dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.setAttribute('value', window.location.href);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    close();
  };

  return (
    <Modal show={show} onHide={close} className="share-modal">
      <Modal.Header closeButton>
        <Modal.Title>Share...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-row justify-content-around mb-3">
          <FacebookShareButton resetButtonStyle={false} url={url} quote={title} className="share-button facebook">
            <FontAwesomeIcon icon={faFacebookSquare} />
          </FacebookShareButton>
          <TwitterShareButton resetButtonStyle={false} url={url} title={title} className="share-button twitter">
            <FontAwesomeIcon icon={faTwitterSquare} />
          </TwitterShareButton>
          <EmailShareButton
            resetButtonStyle={false}
            subject={title}
            body={`Check out this image! ${url}`}
            className="share-button email"
          >
            <FontAwesomeIcon icon={faEnvelopeSquare} />
          </EmailShareButton>
        </div>
        <InputGroup>
          <p className="copy-url">{url}</p>
          <InputGroup.Append>
            <Button variant="secondary" onClick={copyUrlToClipboard}>
              Copy <FontAwesomeIcon icon={faCopy} />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Modal.Body>
    </Modal>
  );
};
