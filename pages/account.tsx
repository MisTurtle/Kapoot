import { SimpleQuizzComponent, SimpleAnswerComponent, SimpleQuestionComponent } from "@common/quizz_components/components";
import { ProtectedRoute } from "@components/wrappers/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";
import { useRouter } from "next/router";
import { handle } from "@common/responses";
import { useEffect, useState } from 'react';
import { UUID } from "crypto";

import styles from './account.module.scss';
import HeroPage from "@components/wrappers/HeroPage";
import HeroLogo from "@components/misc/HeroLogo";
import { CustomNavBar } from '@components/NavBar';

const AccountContent = () => {
  const router = useRouter();
  const { user, details, loading } = useAuth();
  const [quizzes, setQuizzes] = useState<SimpleQuizzComponent[]>([]);
  const [quizzIds, setQuizzIds] = useState<UUID[]>([])
  const [quizzTmsp, setQuizzTmsp] = useState<string[][]>([]);
  if (loading) return <p>Chargement...</p>;
  if (!details) return <p>Can't load account's details</p>;

  const editQuizz = (quizzId: string) => {
    return `/editor?quizz=${quizzId}`;
  };
  useEffect(() => {
    if (details && details.quizzes) {
        const deserializedQuizzes = details.quizzes.map((quizz: any) => {
          const quizzParams = JSON.parse(quizz.params);
          console.log("quizz : ", quizz);
          console.log("params : ", quizz.params);
          console.log("params parsed : ", quizzParams);
          const questions = (quizzParams.children || []).map((q: any) => {
              const answers = (q.children || []).map((a: any) => new SimpleAnswerComponent(a));  
              return new SimpleQuestionComponent(q, ...answers);
          });
          return new SimpleQuizzComponent(quizzParams, ...questions);
        });
        setQuizzes(deserializedQuizzes); 
        console.log("deserializedQuizzes : ", deserializedQuizzes);
        setQuizzIds(details.quizzes.map((quizz: any) => quizz.quizz_id));
        setQuizzTmsp(details.quizzes.map((quizz: any) => [quizz.created_at, quizz.updated_at]));

        setQuizzes(prevQuizzes => [...prevQuizzes]);
    }
  }, [details?.quizzes]); 
  

  return (
      <div className={styles.accountContainer}>
        <header className={styles.titleSection}>
          <h1 className={styles.titlePage}>Your account</h1>
          <div className={styles.navBar}>
            <CustomNavBar links={['home']} />
          </div>
        </header>
          <div className={styles.accountTop}>
            <div className={styles.accountAvatar}>
              <img src="" alt="Avatar"></img>
            </div>
            <div className={styles.accountData}>
              <span className={styles.accountUsername}>{details?.username}</span>
              <span className={styles.accountEmail}>Email: {details?.mail}</span>
            </div>
          </div>
          <span className={styles.quizzTitle}>Quizzes :</span>
          {quizzes.length > 0 ? (
              <div className={styles.userQuizzContainer}>
                  {quizzes.map((quizz, index) => (                      
                    <div className={styles.quizzContainer} key={index}>
                      <a className={styles.editQuizz} href={editQuizz(quizzIds[index])}>{quizz.get("label")}</a>
                      <span className={styles.dateQuizz}>Created at :{quizzTmsp[index][0]}</span>
                      <span className={styles.updatedQuizz}>Updated at :{quizzTmsp[index][1]}</span>
                      <div>
                      {quizz.children && quizz.children.length > 0 ? (
                        quizz.children.map((question, idx) => (
                          <div key={idx}>
                            <p>{question.get("label")}</p>
                          </div>
                        ))
                      ) : (
                          <p>Aucune question disponible pour ce quiz.</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
          ) : (
              <p>No quizz</p>
          )}
      </div>
  );
};

const AccountPage = () => {
    return (
        <ProtectedRoute>
            <AccountContent />
        </ProtectedRoute>
    );
};

export default AccountPage;
