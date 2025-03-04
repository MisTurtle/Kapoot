import React, { useState, useEffect } from 'react';
import { NavBarSignedIn, NavBarSignedOut } from '../components/NavBar';

import styles from './index.module.scss';


const Page = () => {

  // TODO : Turn this into a utility to reduce boilerplate
  const [user, setUser] = useState<UserIdentifier | undefined>(undefined);
  useEffect(() => {
    // Fetch auth status from the express API
    fetch('/api/account')
      .then((res) => {
        if(res.status !== 200) return undefined;
        return res.json();
      })
      .then((data) => { console.log(data); setUser(data) })
      .catch(() => setUser(undefined));
  }, []);

  return (
    <div className={styles.pageContainer}>
      { user ? <NavBarSignedIn /> : <NavBarSignedOut /> }

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

export default Page;
