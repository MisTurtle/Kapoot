import React from 'react';
import { Header, } from '../components/EditorComponents';
import { ProtectedRoute } from '../components/wrappers/ProtectedRoute';
import styles from './editor.module.scss';

const EditorContent = () =>  {
  // TODO : Merge styles with index styles (or at least recurring classes)
  // TODO : This page will take in a Quizz object as a parameter and establish a stream of communication with the server,
  // sending updates everytime the user modifies something (name, settings, questions, ...)
  return (
    <div className={styles.pageContainer}>

    </div>
  )
}

const CreateQuizzPage = () => {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  );
}

export default CreateQuizzPage;