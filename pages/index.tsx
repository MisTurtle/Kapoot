import React from 'react';
import { Home, UserPen, UserPlus } from 'lucide-react';

import NavBar, { NavLink } from '../components/NavBar';
import styles from './index.module.scss';
import logo from '../public/images/Logo_Big.png';


const Page = () => {

  const links: NavLink[] = [
    { label: "Home", href: "#", icon: Home },
    { label: "Sign In", href: "#", icon: UserPen },
    { label: "Register", href: "#", icon: UserPlus },
  ];

  return (
    <header className={styles.pageContainer}>
      <NavBar logo={logo} links={links}/>

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
    </header>
  );
};

export default Page;
