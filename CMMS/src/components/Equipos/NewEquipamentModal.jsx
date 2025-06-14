import React from "react";
import {  Modal, IconButton } from "@mui/material";
import NewEquipamentForm from "./NewEquipamentForm";
import CloseIcon from '@mui/icons-material/Close';

const NewEquipamentModal = ({ open, onClose, sala }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        outline: 'none',
      }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <NewEquipamentForm handleClose={onClose} sala={sala} />
      </div>
    </Modal>
  );
};

export default NewEquipamentModal;
