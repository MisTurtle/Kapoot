import { ProtectedRoute } from '../components/wrappers/ProtectedRoute';
import React from 'react';

const EditorContent = () => {
  return <h1>Hello, Editor!</h1>
};

const EditorPage = () => {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  );
}

export default EditorPage;
