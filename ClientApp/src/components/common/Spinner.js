import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';

const Spinner = ({ size = 'md', variant = 'primary', message = 'Loading...' }) => {
  return (
    <div className="text-center my-4">
      <BootstrapSpinner animation="border" role="status" variant={variant} size={size}>
        <span className="visually-hidden">{message}</span>
      </BootstrapSpinner>
      {message && <p className="mt-2 text-muted">{message}</p>}
    </div>
  );
};

export default Spinner; 