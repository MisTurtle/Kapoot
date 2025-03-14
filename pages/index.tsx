import React from 'react';

import { NavBarAuto } from '@components/NavBar';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import styles from './index.module.scss';
import { useRouter } from 'next/router';
import { usePopup } from '@contexts/PopupContext';
import { handle } from '@common/responses';

// TODO : Add onSubmit={handleSubmit} on form to start the game with a quizz according entered PIN

const IndexContent = () => {
  const router = useRouter();
  const { showPopup } = usePopup();
  const { user } = useAuth();

  const createQuizz = () => {
    if(!user) { router.push('/login'); return; }

    fetch('/api/editor/quizz', { method: 'POST' }).then(async (res) => await handle<{identifier: string}>(
        res,
        
        (result?) => {
          if(!result) throw new Error("Result should always be defined for route POST /api/editor/quizz");
          showPopup('success', 'New quizz created !', 5.0);
          router.push(`/editor?quizz=${result.identifier}`)
        },
        
        (err) => {
          showPopup('error', err, 5.0);
        }
    ));
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
