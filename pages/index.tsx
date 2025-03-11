import React from 'react';

import { NavBarAuto } from '@components/NavBar';
import { AuthProvider } from '@contexts/AuthContext';
import styles from './index.module.scss';
import { useRouter } from 'next/router';

// TODO : Add onSubmit={handleSubmit} on form to start the game with a quizz according entered PIN

const IndexContent = () => {
  const router = useRouter();

  const createQuizz = () => {
    fetch('/api/editor/quizz', { method: 'POST' })
    .then(async (res) => {
      const result = await res.json();
      
      if(!res.ok && result.error === 'Not logged in') return router.push('/login'); // TODO : Make a better system (through constants) to check why an api call failed
      if(!res.ok || !result.identifier) return;  // TODO: Handle error

      const quizz_id = result.identifier;
      return router.push(`/editor?quizz=${quizz_id}`);
    }).catch((error) => { console.log(error); }); // TODO : Popup with an error display (as a reusable element because it can occur on different pages)
  };

  return (
    <div className={styles.pageContainer}>
      <NavBarAuto />
      <div className={styles.pageContent}>
        <h1 className={styles.pageTitle}>Kapoot - Spice up your Quizz</h1>
        <div className={styles.codeInput}>
          <form>
            <input className={styles.enterCode} name="quizzId" placeholder="Code PIN du jeu" type="numeric" />
            <button className={styles.startButton} type="submit">Validate</button>
          </form>
          <button className={styles.createQuizz} onClick={createQuizz}>Create your own quizz</button>
        </div>
      </div>
    </div>
  );
};

const IndexPage = () => {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
}

export default IndexPage;
