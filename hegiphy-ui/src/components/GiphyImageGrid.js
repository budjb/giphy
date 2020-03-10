import React from 'react';
import Loading from './Loading';
import GiphyImage from './GiphyImage';
import './GiphyImageGrid.css';

const ImageGrid = props => {
  const {json} = props;

  if (json.data === undefined) {
    return (
      <center>
        <Loading />
      </center>
    );
  } 
    const {data} = json;

    return (
      <div className="giphy-image-grid">
        {data.map((it, i) => {
          return (
            <div key={i} className="giphy-image-container">
              <GiphyImage image={it} />
            </div>
          );
        })}
      </div>
    );
  
};

export default ImageGrid;
