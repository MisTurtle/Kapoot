import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@components/EditorComponents';
import { ProtectedRoute } from '@components/wrappers/ProtectedRoute';
import styles from './editor.module.scss';
import { useRouter } from 'next/router';
import Loading from '@components/misc/Loading';
import { SimpleQuizzComponent, SimpleQuestionComponent, SimpleAnswerComponent, QuestionComponent, QuizzComponent } from '@server/quizz_components/components';
import { uuidChecker } from '@common/sanitizers';
import { handle } from '@common/responses';
import { usePopup } from '@contexts/PopupContext';



const EditorContent = () =>  {

  const router = useRouter();
  if(!router.isReady) return <Loading />;

  const quizz_id = router.query.quizz;
  if(!quizz_id || typeof quizz_id !== 'string' || !uuidChecker(quizz_id).valid) {
    return <p>No quizz ID entered (TODO: Add a default view here or smth)</p>;
  }

  const { showPopup } = usePopup();
  const [ quizz, setQuizz ] = useState<SimpleQuizzComponent | undefined>(undefined);
  const [ , setVersion ] = useState<number>(0);
  const [ title, setTitle ] = useState<string|undefined>(undefined);
  const [ loading, setLoading ] = useState<boolean>(true);

  const updateRender = () => setVersion(v => v + 1);
  const updateQuizz = () => {
    if (!quizz) return;

    fetch(`/api/editor/quizz/${quizz_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizz),
    }).then(
      () => {},
      (err) => showPopup('error', err, 5.0)
    )
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (quizz) quizz.set("label", newTitle);

    setTitle(newTitle);
    updateQuizz();
  };

  const addQuestion = async () => {
    if (!quizz) return;

    const newQuestion = new SimpleQuestionComponent({label: "la question"}, new SimpleAnswerComponent({label: "c'est la réponse"}));
    if(!quizz) showPopup('error', 'No quizz is currently open', 5.0);
    else quizz.children.push(newQuestion);

    updateRender();
    updateQuizz();
  }

  useEffect(() => {
    fetch(`/api/editor/quizz/${quizz_id}`)
    .then(async (res) => await handle<string>(
        res,
        async (data) => {
          // Data contains the quizz as a stringified JSON
          if(!data) return;
          
          data = JSON.parse(data);
          const quizz = SimpleQuizzComponent.deserialize(data);
          setQuizz(quizz);
          setTitle(quizz.get('label'));
          setLoading(false);
        },
        (err) => {
          // TODO : Handle error with some redirection, maybe
          showPopup('error', err, 5.0);
          setLoading(false);
        }
      ))
  }, [router.query]);

  return (
    <div className={styles.editorContainer}>
      { /* Debug interface to test functionnalities */ }
      { loading ? <Loading /> : 
      <div> 
        { /* <Header /> */ }
        <div className={styles.editorTitle}>
          <h1>Éditeur de Quizz</h1>
        </div>

        { /* Editor Layout View */ }
        <div className={styles.layout}>

          { /* Quizz Questions */ }
          <div className={styles.questionsContainer}>
            <span className={styles.questionsTitle}>Questions</span>
            {quizz?.children.map((question, index) => (
              <div key={index} className={styles.question}>
                <strong>Question :</strong> {question.get('label')}
              </div>
            ))}
            <button className={styles.addQuestionButton} onClick={addQuestion}>Add simple question</button>
          </div>

          { /* Title Bar */ }
          <div className={styles.titleSection}>
            <input type="text" value={title} onChange={handleTitleChange} placeholder="Titre du quizz" className={styles.titleInput}/>
            <div className={styles.titleDisplay}>
              <strong>Titre :</strong> {title || 'Titre non défini'}
            </div>
          </div>

          { /* Preview zone */ }
          <div className={styles.previewSection}>
          </div>

          { /* Component settings zone */ }
          <div className={styles.settingsZone}>
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