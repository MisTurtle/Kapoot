import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@components/wrappers/ProtectedRoute';
import { useRouter } from 'next/router';
import Loading from '@components/misc/Loading';
import { SimpleQuizzComponent, SimpleQuestionComponent, SimpleAnswerComponent, QuestionComponent, QuizzComponent } from '@common/quizz_components/components';
import { uuidChecker } from '@common/sanitizers';
import { handle } from '@common/responses';
import { usePopup } from '@contexts/PopupContext';
import { ArrowLeftIcon, SaveIcon, Trash2Icon, TrashIcon } from 'lucide-react';

import styles from './editor.module.scss';
import { CustomNavBar } from '@components/NavBar';
import { ReactSortable } from 'react-sortablejs';
import { render } from '@client/quizz_components/component_render_map';
import HeroPage from '@components/wrappers/HeroPage';

type QuestionWrapper = {
  id: number;  // The identifier in the editor
  question: QuestionComponent<any>;  // The question object
};

const collapseElement = (e: React.MouseEvent) => {
  const collapseID = e.currentTarget.getAttribute('data-target');
  if(!collapseID) return;
  const element = document.getElementById(collapseID);
  if(!element) return;
  element.classList.toggle(styles.collapsed);
  e.currentTarget.classList.toggle(styles.flipped);
};

const EditorContent = () =>  {
  const router = useRouter();
  const { showPopup } = usePopup();

  /**
   * States
   */
  const [ quizz, setQuizz ] = useState<SimpleQuizzComponent | undefined>(undefined);
  const [ activeQuestion, setActiveQuestion ] = useState<QuestionWrapper | undefined>(undefined);
  const [ allQuestions, setAllQuestions ] = useState<QuestionWrapper[]>([]);
  const [ version, setVersion ] = useState<number>(0);
  const [ title, setTitle ] = useState<string|undefined>(undefined);
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ showSavedMessage, setShowSavedMessage ] = useState(false);

  const updateRender = () => setVersion(v => v + 1);
  const updateQuizz = () => {
    if (!quizz) return;

    const newQuestions = [...allQuestions.map(q => q.question)];
    quizz.children.splice(0, quizz.children.length)
    quizz.children.push(...newQuestions);
    fetch(`/api/editor/quizz/${quizz_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizz),
    }).then(
      () => {},
      (err) => showPopup('error', err, 5.0)
    )
  };

  /**
   * First fetch of the quizz data
   */
  useEffect(() => {
    if(!router.isReady) return;
    fetch(`/api/editor/quizz/${quizz_id}`)
    .then(async (res) => await handle<string>(
        res,
        async (data) => {
          // Data contains the quizz as a stringified JSON
          if(!data) return;
          
          data = JSON.parse(data);
          const quizz = SimpleQuizzComponent.deserialize(data);
          const allQuestionsWrappers = quizz.children.map((q, i) => { return { id: i, question: q }; }) as QuestionWrapper[];
          setAllQuestions(allQuestionsWrappers);

          if(quizz.children.length > 0) 
            setActiveQuestion({id: 0, question: quizz.children[0] as QuestionComponent<any>});

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

  /**
   * Automatic quizz saving when questions change
   */
  useEffect(() => { updateQuizz(); }, [allQuestions, version]);  // TODO : This is a lot of requests, maybe try to reduce the amount of patches by refining the dependencies

  /**
   * Additional one shot setup
   */
  useEffect(() => {
    /**
     * CTRL+S catch
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        setShowSavedMessage(true);

        setTimeout(() => { setShowSavedMessage(false); }, 5000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); };
  })

  if(!router.isReady) return <Loading />;

  const quizz_id = router.query.quizz;
  if(!quizz_id || typeof quizz_id !== 'string' || !uuidChecker(quizz_id).valid) {
    return <p>No quizz ID entered (TODO: Add a default view here or smth)</p>;
  }

  /**
   * HTML Event Handlers -- Inputs
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    quizz?.set("label", newTitle);
    setTitle(newTitle);
    updateQuizz();
  };

  const handleQuestionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    activeQuestion?.question.set('label', newTitle);

    updateRender();
    updateQuizz();
  };

  /**
   * Question user actions
   */
  const addQuestion = () => {
    if (!quizz) return showPopup('error', 'No quizz is currently open', 5.0);

    const newQuestion = new SimpleQuestionComponent(
      {label: `Question #${allQuestions.length}`},
      new SimpleAnswerComponent({label: "c'est la réponse A"}),
      new SimpleAnswerComponent({label: "c'est la réponse B"}),
      new SimpleAnswerComponent({label: "c'est la réponse C"}),
      new SimpleAnswerComponent({label: "c'est la réponse D"})
    );
    setAllQuestions(prev => {
      const wrapper = {id: prev.length, question: newQuestion};
      setActiveQuestion(wrapper)
      return [...prev, wrapper];
    });
  };

  const selectQuestion = (index: number) => {
    if(!quizz) return showPopup('error', 'No quizz is currently open', 5.0);

    setActiveQuestion(allQuestions.find(w => w.id === index));
  };

  const removeQuestion = (index: number) => {
    if(!quizz) return showPopup('error', 'No quizz is currently open', 5.0);

    setAllQuestions(prev => { 
      if(index === activeQuestion?.id)
      {
        if(prev.length === 1) setActiveQuestion(undefined);
        else setActiveQuestion(index !== 0 ? prev[index - 1] : prev[1]);
      }
      prev.splice(index, 1);
      return prev.map(wrapper => { return { id: wrapper.id < index ? wrapper.id : wrapper.id - 1, question: wrapper.question }});
    });
  };

  return (
    <div className={styles.editorContainer}>
      { /* Debug interface to test functionnalities */ }
      { loading && <Loading /> }
      { !loading && <>
        { /* Header Title Bar */ }
        <header className={styles.titleSection}>
          <input type="text" value={title} onChange={handleTitleChange} placeholder="Quizz Title..." className={styles.titleInput}/>
          <p className={`${styles.savedAutomatically} ${showSavedMessage ? styles.active : ""}`}><SaveIcon width={16}/>Your quizz is saved automatically !</p>
          <div className={styles.navBar}>
            <CustomNavBar links={['home']} />
          </div>
        </header>

        { /* Main content view */ }
        <div className={styles.editorBody}>

          { /* Quizz Questions Side Panel */ }
          { quizz && <aside id="questionsContainer" className={styles.questionsContainer}>
            <span className={styles.questionsTitle}>Questions</span>
            <ReactSortable group='questions' list={allQuestions} setList={setAllQuestions} animation={200} ghostClass={`${styles.dragging}`}>
              {allQuestions.map((wrapper) => (
                <div
                  key={wrapper.id}
                  onClick={() => selectQuestion(wrapper.id)}
                  className={`${styles.question} ${activeQuestion?.id === wrapper.id ? styles.active : ""}`}
                >
                  <p className={styles.questionLabel}>
                    <strong>#{allQuestions.indexOf(wrapper)}</strong> {wrapper.question.get("label")}
                  </p>
                  <button className={styles.deleteQuestion} onClick={() => removeQuestion(wrapper.id)}>
                    <Trash2Icon width={16} />
                  </button>
                </div>
              ))}
            </ReactSortable>
            <button className={styles.addQuestionButton} onClick={addQuestion}>Add question</button>
          </aside> }
          
          { /* Resize handle */ }
          <div className={styles.collapseButton} data-target="questionsContainer" onClick={collapseElement}>
            <ArrowLeftIcon width={16} />
          </div>

          { /* Main Preview zone. Might change that to directly rendering the quizz with a question index */ }
          <HeroPage className={styles.previewSection}>
          {
            activeQuestion === undefined ? 
            <>No question selected</> 
            :
            <>
              <input type="text" value={activeQuestion.question.get('label')} onChange={handleQuestionTitleChange} className={styles.questionInput} />
              { render(activeQuestion.question, true) }
            </>
          }
          </HeroPage>

        </div>
      </>}
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