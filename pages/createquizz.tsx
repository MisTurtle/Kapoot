import React from 'react';
import NewQuizz from '../components/NewQuizz';
import { ProtectedRoute } from '../components/wrappers/ProtectedRoute';

const CreateQuizzContent = () =>  {
  return <NewQuizz />; // TODO : See if this wouldn't be better as a page, not a component
}

const CreateQuizzPage = () => {
  return (
    <ProtectedRoute>
      <CreateQuizzContent />
    </ProtectedRoute>
  );
}

export default CreateQuizzPage;