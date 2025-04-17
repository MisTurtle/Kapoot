import { SimpleQuizzComponent } from "@common/quizz_components/components";
import { ProtectedRoute } from "@components/wrappers/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";
import { useRouter } from "next/router";
import { handle } from "@common/responses";
import { useEffect, useState } from 'react';

import styles from './account.module.scss';
import HeroPage from "@components/wrappers/HeroPage";
import { CustomNavBar } from '@components/NavBar';
import { usePopup } from "@contexts/PopupContext";
import Loading from "@components/misc/Loading";

const AccountContent = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<AccountDetails>();
  const [userDataTrigger, UpdateUserDataTrigger] = useState(0);
  const { showPopup } = usePopup();
  const [quizzes, setQuizzes] = useState<SimpleQuizzComponent[]>([]);
  const [quizzIds, setQuizzIds] = useState<string[]>([])
  const [quizzTmsp, setQuizzTmsp] = useState<string[][]>([]);
  if (loading) return <p>Chargement...</p>;

  const editQuizz = (quizzId: string) => `/editor?quizz=${quizzId}`;

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
              <img src={ '/public/images/users' + userData?.avatar} alt="Avatar"></img>
            </div>
            <div className={styles.accountData}>
              <span className={styles.accountUsername}>{user.username}</span>
              <span className={styles.accountEmail}>Email: {user.mail}</span>
              <span className={styles.accountNbQuizzes}>QuizzCreated: {userData?.quizzes_created}</span>
              <span className={styles.accountNbGames}>games_played: {userData?.games_played}</span>
              <span className={styles.accountNbPoints}>total_points: {userData?.total_points}</span>
            </div>
          </div>
          
          <div className={styles.quizzSection}>
            
            {quizzes.length > 0 ? (
                <div className={styles.userQuizzContainer}>
                  <span className={styles.quizzContainerTitle}>Quizzes :</span>
                    {quizzes.map((quizz, index) => (                      
                      <div className={styles.quizzContainer} key={index}>
                        <div className={styles.quizzData}>
                          <a className={styles.editQuizz} href={editQuizz(quizzIds[index])}>{quizz.get("label")}</a>
                          <p>{quizz.get("description")}</p>
                          <button className={styles.removeQuizz} onClick={() => removeQuizz(quizzIds[index])}>DELETE</button>
                        </div>
                        <div className={styles.quizzTime}>
                          <span className={styles.dateQuizz}>Created on { formatDateWithOrdinal(quizzTmsp[index][0])}</span>
                          <span className={styles.updatedQuizz}> Last update on {formatDateWithOrdinal(quizzTmsp[index][1])}</span>
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
