import { SimpleQuizzComponent } from "@common/quizz_components/components";
import { ProtectedRoute } from "@components/wrappers/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";
import { useRouter } from "next/router";
import { handle } from "@common/responses";
import { useEffect, useState } from 'react';
import Link from "next/link";

import styles from './account.module.scss';
import HeroPage from "@components/wrappers/HeroPage";
import { CustomNavBar } from '@components/NavBar';
import { usePopup } from "@contexts/PopupContext";
import Loading from "@components/misc/Loading";
import Head from "next/head";

const AccountContent = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<AccountDetails>();
  const [userDataTrigger, UpdateUserDataTrigger] = useState(0);
  const { showPopup } = usePopup();
  const [quizzes, setQuizzes] = useState<SimpleQuizzComponent[]>([]);
  const [quizzIds, setQuizzIds] = useState<string[]>([])
  const [quizzTmsp, setQuizzTmsp] = useState<string[][]>([]);
  const [shownQuestions, setShownQuestions] = useState<boolean[]>([]);
  if (loading) return <p>Chargement...</p>;

  const editQuizz = (quizzId: string) => `/editor?quizz=${quizzId}`;

  const toggleQuestions = (index: number) => {
    setShownQuestions((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  // Gets user quizzes
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
        setShownQuestions(new Array(deserializedQuizzes.length).fill(false));
        setQuizzes(deserializedQuizzes);
        setQuizzTmsp(quizzTmsp);
      },
      (error) => {
        showPopup('error', error, 5.0);
      }
    ));
  }, []);

  useEffect(() => {
    if (!user?.identifier) return;
  
    fetch(`/api/user/${user.identifier}`)
      .then(res =>
        handle(
          res,
          (result: AccountDetails | undefined) => {
            if (!result) return;
  
            const userDetails: AccountDetails = {
              ...user,
              ...result,
            };
  
            setUserData(userDetails);
          },
          (err) => showPopup("error", err, 5)
        )
      );
  }, [user, userDataTrigger]);

  const removeQuizz = (quizzId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this quizz?");
    if (!confirmDelete) return;

    fetch(`/api/editor/quizz/${quizzId}`, { method: "DELETE" }).then(async (res) =>
      await handle(
        res,
        (result) => {
          if (!result) throw new Error("Result should always be defined for route POST /api/editor/quizz");
          showPopup("success", "Quizz deleted with success!", 5.0);
          setQuizzIds((prev) => prev.filter((id) => id !== quizzId));
          setQuizzTmsp((prev) => prev.filter((_, idx) => quizzIds[idx] !== quizzId));
          setQuizzes((prev) => prev.filter((_, index) => quizzIds[index] !== quizzId));
          UpdateUserDataTrigger(prev => prev + 1);
        },
        (err) => {
          showPopup("error", err, 5.0);
        }
      )
    );
  };
  
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th'; // 11th–13th
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  const formatDateWithOrdinal = (dateStr: string) => {
    const date = new Date(dateStr);
  
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
  
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
  
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${month} ${day}${suffix}, ${year} at ${hours}:${minutes}`;
  };

  const createQuizz = () => {
          if(!user) {
              router.push("/login");
              return;
          }
  
          fetch("/api/editor/quizz", { method: "POST" }).then(async (res) =>
              await handle<{ identifier: string }>(
                  res,
                  (result?) => {
                      if (!result) throw new Error("Result should always be defined for route POST /api/editor/quizz");
                      showPopup("success", "New quizz created!", 5.0);
                      router.push(`/editor?quizz=${result.identifier}`);
                  },
                  (err) => {
                      showPopup("error", err, 5.0);
                  }
              )
          );
      };

    const startGame = (quizz_id: string) => {
        fetch("/api/game", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ "quizz_id": quizz_id })
        })
        .then(async data => await handle(
          data,
          (data) => {
            router.push("/game");
          },
          (err) => {
            showPopup('error', err, 5.0);
        }))
        .catch(err => showPopup('error', err, 5.0))
      };

  if(!user) return <Loading />;
  return (
      <>
        <Head>
          <title>Kapoot | Account</title>
        </Head>
        <div className={styles.accountPage}> 
          <header className={styles.titleSection}>
            <h1 className={styles.titlePage}>Your account</h1>
            <CustomNavBar links={['home']} />
          </header>        
          <div className={styles.accountTop}>
            
            <div className={styles.accountUserInfo}>
              <div className={styles.accountAvatar}>
                <img src={ '/images/users/' + (userData?.avatar ?? 'default.png') } alt="Avatar"></img>
              </div>
              <div className={styles.accountData}>
                <span className={styles.accountUsername}>{user.username}</span>
                <span className={styles.accountEmail}>{user.mail}</span>
              </div>
            </div>
            <div className={styles.accountStatsList}>
              <span className={styles.accountStatsItem}>{userData?.quizzes_created} quizz{userData?.quizzes_created > 1 ? 'es' : ''} created</span>
              <span className={styles.accountStatsItem}>|</span>
              <span className={styles.accountStatsItem}>{userData?.games_played} game{userData?.games_played > 1 ? 's' : ''} played</span>
              <span className={styles.accountStatsItem}>|</span>
              <span className={styles.accountStatsItem}>{userData?.total_points} point{userData?.total_points > 1 ? 's' : ''} earned</span> 
            </div>
          </div>
            {quizzes.length > 0 ? (
              <div className={styles.userQuizzContainer}>
                <span className={styles.quizzContainerTitle}>Your quizz{quizzes.length > 1 ? 'es' : ''}</span>
                <span className={styles.newQuizz} onClick={createQuizz}>Make a new one!</span>
                {quizzes.map((quizz, index) => (                      
                  <div className={styles.quizzContainer} key={index}>
                    <div className={styles.quizzSection}>
                      <div className={styles.quizzLeft}>
                        <a className={styles.editQuizz} href={editQuizz(quizzIds[index])}>{quizz.get("label")}</a>
                        <button className={styles.createGame} onClick={() => startGame(quizzIds[index])}>Create Game</button>
                        {/* <p>{quizz.get("description")}</p> */}
                      </div>
                      <div className={styles.quizzTime}>
                        <span className={styles.dateQuizz}>Created on { formatDateWithOrdinal(quizzTmsp[index][0])}</span>
                        <span className={styles.dateQuizz}> Last update on {formatDateWithOrdinal(quizzTmsp[index][1])}</span>
                      </div>
                      <div className={styles.quizzQuestions}>
                        <span className={styles.quizzQuestionLabel}>{ quizz.children.length} question{quizz.children.length > 1 ? 's' : ''}</span>
                        <span className={styles.quizzShowQuestion} onClick={() => toggleQuestions(index)}>Show/hide question{quizz.children.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className={styles.quizzRigth}>
                        <button className={styles.removeQuizz} onClick={() => removeQuizz(quizzIds[index])}>DELETE</button>
                      </div>
                    </div>
                    {shownQuestions[index] && (
                    <div className={styles.questionSection}>
                      {/* <div className={styles.questionsContainer}> */}
                        {quizz.children.length > 0 ? ( quizz.children.map((question, idx) => (
                          <div className={styles.question} key={idx}>
                            <span className={styles.questionTitle}>Question {idx+1} : {question.get("label")}</span>
                            <span className={styles.questionDescription}>{question.get("description")}</span>
                          </div>
                          
                          ))
                        ) : (
                          <p>This quizz does not contain any question</p>
                        )}
                      {/* </div> */}
                    </div>
                    )}
                  </div>
                  
                ))}
              </div>
            ) : (
              <div className={styles.noQuizz}>
                <span className={styles.noQuizzLabel}>You haven't created a quizz yet</span>
                <p className={styles.quizzCreateParagraph}>Want to create your own quizz? It's over <span onClick={createQuizz}> here!</span></p>
              </div>
            )}
        </div> 
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
