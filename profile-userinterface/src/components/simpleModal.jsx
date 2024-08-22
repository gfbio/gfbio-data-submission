import React from 'react';
import PropTypes from 'prop-types';

const SimpleModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Are you absolutely sure?</h2>
        <p>
          This action cannot be undone. This will permanently delete the
          submission &ldquo;{itemName}&rdquo; and remove it from our servers.
        </p>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
};

SimpleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  itemName: PropTypes.string.isRequired
};

export default SimpleModal;
