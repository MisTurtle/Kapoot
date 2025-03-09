import React from 'react';

import { NavBarAuto } from '../components/NavBar';
import { AuthProvider } from '../contexts/AuthContext';
import styles from './index.module.scss';

// TODO : Add onSubmit={handleSubmit} on form to start the game with a quizz according entered PIN

const LoginContent = () => {
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
          <a className={styles.ownQuizz} href="createquizz">Create your own quizz</a>
        </div>
      </div>
    </div>


  );
};

const LoginPage = () => {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}

export default LoginPage;
