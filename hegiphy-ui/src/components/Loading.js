import React from 'react';
import { RotateLoader } from 'react-spinners';

export default () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div>
        <RotateLoader />
      </div>
    </div>
  );
};
