import { SimpleQuizzComponent, SimpleAnswerComponent, SimpleQuestionComponent } from "@common/quizz_components/components";
import { ProtectedRoute } from "@components/wrappers/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";
import { useRouter } from "next/router";
import { handle } from "@common/responses";
import { useEffect, useState } from 'react';
import { UUID } from "crypto";

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
          const questions = (quizzParams.children || []).map((q: any) => {
              const answers = (q.children || []).map((a: any) => new SimpleAnswerComponent(a));  
              return new SimpleQuestionComponent(q, ...answers);
          });
          return new SimpleQuizzComponent(quizzParams, ...questions);
        });
        setQuizzes(deserializedQuizzes); 
        const ids = details.quizzes.map((quizz: any) => quizz.quizz_id); 
        setQuizzIds(ids);
        const tmsp = details.quizzes.map((quizz: any) => [quizz.created_at, quizz.updated_at]); 
        setQuizzTmsp(tmsp);
    }
  }, [details]); 
  return (
      <div>
          <h1>Account Page</h1>
          <p>Welcome, {details?.username}</p>
          <p>Email: {details?.mail}</p>
          <h2>Quizzes :</h2>
          {quizzes.length > 0 ? (
              <div>
                  {quizzes.map((quizz, index) => (                      
                    <div key={index}>
                      <a href={editQuizz(quizzIds[index])}>{quizz.get("label")}</a>
                      <p>Created at :{quizzTmsp[index][0]}</p>
                      <p>Updated at :{quizzTmsp[index][1]}</p>
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
