import { SimpleQuizzComponent } from "@common/quizz_components/components";
import { ProtectedRoute } from "@components/wrappers/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";
import { useRouter } from "next/router";
import { handle } from "@common/responses";
import { useEffect, useState } from 'react';

import styles from './account.module.scss';
import HeroPage from "@components/wrappers/HeroPage";
import HeroLogo from "@components/misc/HeroLogo";
import { CustomNavBar } from '@components/NavBar';
import { usePopup } from "@contexts/PopupContext";
import Loading from "@components/misc/Loading";

const AccountContent = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showPopup } = usePopup();
  const [quizzes, setQuizzes] = useState<SimpleQuizzComponent[]>([]);
  const [quizzIds, setQuizzIds] = useState<string[]>([])
  const [quizzTmsp, setQuizzTmsp] = useState<string[][]>([]);
  if (loading) return <p>Chargement...</p>;

  const editQuizz = (quizzId: string) => `/editor?quizz=${quizzId}`;

  useEffect(() => {
    fetch('/api/editor/quizz', {
      'method': 'GET'
    }).then(async res => await handle(
      res,
      (result?: SerializedQuizz[]) => {
        const quizzIds = result?.map(quizz => quizz.quizz_id) ?? [];
        const deserializedQuizzes = result?.map(quizz => SimpleQuizzComponent.deserialize(JSON.parse(quizz.params))) ?? [];
        const quizzTmsp = result?.map(quizz => [quizz.created_at, quizz.updated_at]) ?? [];

        setQuizzIds(quizzIds);
        setQuizzes(deserializedQuizzes);
        setQuizzTmsp(quizzTmsp);
      },
      (error) => {
        showPopup('error', error, 5.0);
      }
    ));
  }, []);

  const removeQuizz = (quizzId: string) => {
      fetch(`/api/editor/quizz/${quizzId}`, { method: "DELETE" }).then(async (res) =>
        await handle(
          res,
          (result) => {
            if (!result) throw new Error("Result should always be defined for route POST /api/editor/quizz");
            showPopup("success", "Quizz deleted with success!", 5.0);

            setQuizzIds((prev) => prev.filter((id) => id !== quizzId));
            setQuizzTmsp((prev) => prev.filter((_, idx) => quizzIds[idx] !== quizzId));
            setQuizzes((prev) => prev.filter((_, index) => quizzIds[index] !== quizzId));
          },
          (err) => {
            showPopup("error", err, 5.0);
          }
        )
      );
    };
  

  if(!user) return <Loading />;
  return (
      <>
        <header className={styles.titleSection}>
          <h1 className={styles.titlePage}>Your account</h1>
          <CustomNavBar links={['home']} />
        </header>

        <HeroPage className={styles.heroContent}>
         
          <div className={styles.accountTop}>
            <div className={styles.accountAvatar}>
              <img src="" alt="Avatar"></img>
            </div>
            <div className={styles.accountData}>
              <span className={styles.accountUsername}>{user.username}</span>
              <span className={styles.accountEmail}>Email: {user.mail}</span>
            </div>
          </div>
          
          <div className={styles.quizzSection}>
            <span className={styles.quizzTitle}>Quizzes :</span>
            
            {quizzes.length > 0 ? (
                <div className={styles.userQuizzContainer}>
                    {quizzes.map((quizz, index) => (                      
                      <div className={styles.quizzContainer} key={index}>
                        <div className={styles.quizzData}>
                          <a className={styles.editQuizz} href={editQuizz(quizzIds[index])}>{quizz.get("label")}</a>
                          <p>{quizz.get("description")}</p>
                          <button className={styles.removeQuizz} onClick={() => removeQuizz(quizzIds[index])}>DELETE</button>
                        </div>
                        <div className={styles.quizzTime}>
                          <span className={styles.dateQuizz}>Created at :{quizzTmsp[index][0]}</span>
                          <span className={styles.updatedQuizz}> Last update :{quizzTmsp[index][1]}</span>
                        </div>
                        <div className={styles.questionsContainer}>
                        {quizz.children && quizz.children.length > 0 ? (
                          quizz.children.map((question, idx) => (
                            <div className={styles.question} key={idx}>
                              <p>{question.get("label")}</p>
                            </div>
                          ))
                        ) : (
                            <p>This quizz does not contain any question</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
            ) : (
                <p>No quizz</p>
            )}
          </div>
        </HeroPage>
      </>
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
