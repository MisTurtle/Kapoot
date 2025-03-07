import React from 'react';

import { NavBarAuto } from '../components/NavBar';
import { AuthProvider } from '../contexts/AuthContext';
import styles from './index.module.scss';


const LoginContent = () => {
  return (
    <div className={styles.pageContainer}>
      <NavBarAuto />

      <div className={styles.pageContent}>

        <h1 className={styles.pageTitle}>Kapoot - Spice up your Quizz</h1>
        <div className="code-input">
          <form>
            <input className="enter-code" name="quizzId" placeholder="Code PIN du quizz" type="numeric" />
            <button className="start-button" type="submit" value="start">Validate</button>
          </form>
          <a href="createquizz">Create your own quizz</a>
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
