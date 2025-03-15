import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@components/EditorComponents';
import { ProtectedRoute } from '@components/wrappers/ProtectedRoute';
import styles from './editor.module.scss';
import { useRouter } from 'next/router';
import Loading from '@components/misc/Loading';
import { SimpleQuizzComponent, SimpleQuestionComponent, SimpleAnswerComponent, QuestionComponent } from '@server/quizz_components/components';
import { uuidChecker } from '@common/sanitizers';
import { handle } from '@common/responses';


const EditorContent = () =>  {
  // TODO : Merge styles with index styles (or at least recurring classes)
  // TODO : This page will take in a Quizz object as a parameter and establish a stream of communication with the server,
  // sending updates everytime the user modifies something (name, settings, questions, ...)
  const { query, isReady } = useRouter();
  const [title, setTitle] = useState<string>('');
  if(!isReady) return <Loading />;

  const quizz_id = query.quizz;
  if(!quizz_id || typeof quizz_id !== 'string' || !uuidChecker(quizz_id).valid) {

    return;
  }

  const [ quizz, setQuizz ] = useState<SimpleQuizzComponent | undefined>(undefined);
  const [ loading, setLoading ] = useState<boolean>(true);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (quizz) quizz.set("label", newTitle);
    setTitle(newTitle);
    updateQuizz();
  };
  
  const updateQuizz = async () => {
    if (!quizz) return;
    const serializedData = JSON.stringify(quizz.toJSON());
    console.log("serializedData : ", serializedData)
    await fetch(`/api/editor/quizz/${quizz_id}/params`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params: serializedData }),
    });
  };

  const addQuestion = async () => {
    if (!quizz) return;

    const newQuestion = new SimpleQuestionComponent({label: "la question"});
    newQuestion.children.push(new SimpleAnswerComponent({label: "c'est la réponse"}));

    quizz.children.push(newQuestion);
    setQuizz(quizz); 
    updateQuizz();
    
  }


  useEffect(() => {
    fetch(`/api/editor/quizz/${quizz_id}`)
    .then(async (res) => await handle(
        res,
        async (data) => {
          // Data contains the quizz as JSON
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
          console.log("Quiz test désérialisé :", quizz2.children);
        },
        () => {
          // TODO : Handle error
          setQuizz(undefined);
          setLoading(false);
        }
      ))
  }, [query]);

  return (
    <div className={styles.editorContainer}>
      { /* Debug interface to test functionnalities */ }
      { loading ? <Loading /> : 
      <div> 
        { /* <Header /> */ }
        <div className={styles.editorTitle}>
          <h1>Éditeur de Quizz</h1>
        </div>
        <div className={styles.layout}>
          <div className={styles.questionsContainer}>
            <span className={styles.questionsTitle}>Questions</span>
            {quizz?.children.map((question, index) => (
              <div key={index} className={styles.question}>
                <strong>Question :</strong> {question.get('label')}
              </div>
            ))}
            <button className={styles.addQuestionButton} onClick={addQuestion}>Add simple question</button>
          </div>
          <div className={styles.titleSection}>
            <input type="text" value={title} onChange={handleTitleChange} placeholder="Titre du quizz" className={styles.titleInput}/>
            <div className={styles.titleDisplay}>
              <strong>Titre :</strong> {title || 'Titre non défini'}
            </div>
          </div>          
        </div>
        
    </div>
    }
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