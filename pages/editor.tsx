import React, { useEffect, useState } from 'react';
import { Header } from '@components/EditorComponents';
import { ProtectedRoute } from '@components/wrappers/ProtectedRoute';
import styles from './editor.module.scss';
import { useRouter } from 'next/router';
import Loading from '@components/misc/Loading';
import { SimpleQuizzComponent } from '@server/quizz_components/components';
import { uuidChecker } from '@common/sanitizers';
import { deserialize } from 'v8';

const EditorContent = () =>  {
  // TODO : Merge styles with index styles (or at least recurring classes)
  // TODO : This page will take in a Quizz object as a parameter and establish a stream of communication with the server,
  // sending updates everytime the user modifies something (name, settings, questions, ...)
  const { query, isReady } = useRouter();
  if(!isReady) return <Loading />;

  const quizz_id = query.quizz;
  if(!quizz_id || typeof quizz_id !== 'string' || !uuidChecker(quizz_id).valid) {

    return;
  }

  const [ quizz, setQuizz ] = useState<SimpleQuizzComponent | undefined>(undefined);
  const [ loading, setLoading ] = useState<boolean>(true);

  useEffect(() => {
    fetch(`/api/editor/quizz/${quizz_id}`)
    .then(async (res) => {
      if(!res.ok) { setQuizz(undefined); setLoading(false); return; }  // TODO: Handle error
      const data = await res.text();
      setQuizz(new SimpleQuizzComponent({}));  // TODO : Actually deserialize the data (Write deserializer classes in src/server/quizz_components)
      setLoading(false);
      console.log(data);
      
      // Test to deserialize a quizz
      const monQuizzData = {
        id: "12345",
        title: "Quiz test",
        questions: [
            { type: "q:open", text: "Test qu1", answer: "this is open"},
            { type: "q:bin", text: "Test qu2", answerTrue: true, answerFalse: false },
            { type: "q:simple", text: "Test qu3", answers: ["answer1", 1, 4, "answer4"]},
            { type: "q:mcq", text: "Test qu4", answers: [5]}
        ]
      };
      const quizz2 = SimpleQuizzComponent.deserialize(monQuizzData); 
      console.log("Quiz désérialisé :", quizz2.children);

      return;
    })
  }, [query]);

  return (
    <div className={styles.pageContainer}>
      { /* Debug interface to test functionnalities */ }
      { loading ? <Loading /> : <div><p>{JSON.stringify(quizz)}</p> <Header /></div>}

    </div>
  );
}

const CreateQuizzPage = () => {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  );
}

export default CreateQuizzPage;