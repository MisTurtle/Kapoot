import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@components/EditorComponents';
import { ProtectedRoute } from '@components/wrappers/ProtectedRoute';
import { useRouter } from 'next/router';
import Loading from '@components/misc/Loading';
import { SimpleQuizzComponent, SimpleQuestionComponent, SimpleAnswerComponent, QuestionComponent, QuizzComponent } from '@server/quizz_components/components';
import { uuidChecker } from '@common/sanitizers';
import { handle } from '@common/responses';
import { usePopup } from '@contexts/PopupContext';
import { ArrowLeftIcon } from 'lucide-react';

import styles from './editor.module.scss';


const collapseElement = (e: React.MouseEvent) => {
  const collapseID = e.currentTarget.getAttribute('data-target');
  if(!collapseID) return;
  const element = document.getElementById(collapseID);
  if(!element) return;
  console.log(styles);
  element.classList.toggle(styles.collapsed);
};

const EditorContent = () =>  {

  const router = useRouter();
  if(!router.isReady) return <Loading />;

  const quizz_id = router.query.quizz;
  if(!quizz_id || typeof quizz_id !== 'string' || !uuidChecker(quizz_id).valid) {
    return <p>No quizz ID entered (TODO: Add a default view here or smth)</p>;
  }

  const { showPopup } = usePopup();
  const [ question, selectQuestion ] = useState<QuestionComponent<any> | undefined>(undefined);
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
    quizz?.set("label", newTitle);
    setTitle(newTitle);
    updateQuizz();
  };

  const handleQuestionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    question?.set('label', newTitle);

    updateRender();
    updateQuizz();
  };

  const addQuestion = async () => {
    if (!quizz) return;

    const newQuestion = new SimpleQuestionComponent({label: "la question"}, new SimpleAnswerComponent({label: "c'est la réponse"}));
    if(!quizz) showPopup('error', 'No quizz is currently open', 5.0);
    else quizz.children.push(newQuestion);

    selectQuestion(newQuestion);
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
          if(quizz.children.length > 0) selectQuestion(quizz.children[0] as QuestionComponent<any>);
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
      { loading ? <Loading /> : <div className={styles.layout}>
      
        { /* Header Title Bar */ }
        <header className={styles.titleSection}>
          <input type="text" value={title} onChange={handleTitleChange} placeholder="Quizz Title..." className={styles.titleInput}/>
        </header>

        { /* Main content view */ }
        <div className={styles.editorBody}>

          { /* Quizz Questions Side Panel */ }
          <aside id="questionsContainer" className={styles.questionsContainer}>
            <span className={styles.questionsTitle}>Questions</span>
            {quizz?.children.map((question, index) => (
              <div key={index} onClick={() => selectQuestion(quizz.children[index] as QuestionComponent<any>)} className={styles.question}>
                <strong>Question :</strong> {question.get('label')}
              </div>
            ))}
            <button className={styles.addQuestionButton} onClick={addQuestion}>Add simple question</button>
          </aside>

          { /* Resize handle */ }
          <div className={styles.resizeHandle} data-target="questionsContainer" onClick={collapseElement}>
            <ArrowLeftIcon width={16} />
          </div>

          { /* Main Preview zone */ }
          <main className={styles.previewSection}>
            {
              question === undefined ? 
              <>No question selected</> 
              :
              <>
                <input type="text" value={question.get('label')} onChange={handleQuestionTitleChange} className={styles.questionInput} />
                <p>TODO : Show render here</p>
              </>
            }
          </main>

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