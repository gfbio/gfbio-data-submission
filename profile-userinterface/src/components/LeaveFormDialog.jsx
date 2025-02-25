import { Button, Group, Modal } from '@mantine/core';
import PropTypes from 'prop-types';

const LeaveFormDialog = ({ isOpen, onCancel, onSave, onDiscard }) => {
  return (
    <Modal 
      opened={isOpen} 
      onClose={onCancel}
      title="Leave this section ?"
      centered
      scrollbarType="native"
      withOverlay
      lockScroll={false}
      overlayProps={{
        opacity: 0.55,
        blur: 3
      }}
      styles={{
        title: {
          fontWeight: 'normal',
          fontSize: '1.2rem',
          color: '#495057'
        },
        body: {
          padding: '1.5rem'
        },
        header: {
          padding: '1.5rem 1.5rem 0 1.5rem'
        }
      }}
    >
      <p style={{ color: '#495057', marginBottom: '2rem' }}>
        Are you sure leaving this form ? Press &apos;Cancel&apos; to stay or press &apos;Save&apos; to save changes before leaving. Press &apos;Discard&apos; to leave with out saving.
      </p>
      
      <Group justify="space-evenly">
        <Button 
          size="md"
          onClick={onCancel}
          className="green-button"
        >
          <i className="icon ion-md-close me-2"/>{' '}
          Cancel
        </Button>
        <Button
          size="md"
          onClick={onSave}
          className="blue-button"
        >
          <i className="icon ion-ios-save me-2"/>{' '}
          Save
        </Button>
        <Button
          size="md"
          onClick={onDiscard}
          className="red-button"
        >
          <i className="icon ion-md-alert me-2"/>{' '}
          Discard
        </Button>
      </Group>
    </Modal>
  );
};

LeaveFormDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDiscard: PropTypes.func.isRequired
};

export default LeaveFormDialog; 