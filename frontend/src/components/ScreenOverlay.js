import React from 'react';
import TaskFormModal from './task-form/TaskFormModal.jsx';

/**
 * ScreenOverlay / FullScreenOverlay
 * Encapsula o TaskFormModal unificado para acionamento global via botão flutuante e atalhos.
 */
export default function FullScreenOverlay(props) {
  return <TaskFormModal {...props} />;
}
