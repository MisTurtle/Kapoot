// TODO : Check if the user is in game (admin or player). If not, redirect to the home page

import ClientGameSocketHandler from "@client/client_game_socket_handler";
import { handle } from "@common/responses";
import Loading from "@components/misc/Loading";
import { AuthProvider, useAuth } from "@contexts/AuthContext";
import { usePopup } from "@contexts/PopupContext";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import FloatingEmotes from "@components/misc/FloatingEmotes"
import { emoteChars, getEmoteIcon } from "@client/utils";
import { CheckCheck, ChevronRightIcon, CrossIcon, Home, Users, X, XCircle } from "lucide-react";
import { QuestionComponent } from "@common/quizz_components/components";
import { renderInEditor, renderInGame } from "@client/quizz_components/component_render_map";
import { ContextMenuProvider } from "@contexts/EditorContextMenus";
import HeroPage from "@components/wrappers/HeroPage";


import styles from './game.module.scss';
import QuestionTimer from "@components/quizz/TimerComponent";

const GamePageContent = () => {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { showPopup } = usePopup();

    const answerCountRef = useRef<HTMLDivElement | null>(null);
    const socketRef = useRef<WebSocket | undefined>(undefined);
    const socketHandlerRef = useRef<ClientGameSocketHandler | null>(null);

    const [ game, setGame ] = useState<GamePageInitiatorValues | undefined | null>();
    const [ players, setPlayers ] = useState<GamePlayer[]>([]);

    const [ showLeaderboard, setShowLeaderboard ] = useState(false);
    const [ correctAnswer, setCorrectAnswer ] = useState<number | undefined>(undefined);
    const [ currentRank, setCurrentRank ] = useState<number | undefined>(undefined);
    
    const [ currentQuestion, setCurrentQuestion ] = useState<QuestionComponent<BaseQuestionProps> | undefined>(undefined);
    const [ answers, setAnswers ] = useState<number[]>([]);
    const [ timerValue, setTimerValue ] = useState<number>(0);
    const [ myAnswer, setMyAnswer ] = useState<number | undefined>(0);
    const [ ended, setEnded ] = useState<boolean>(false);

    const [ chatInput, setChatInput ] = useState("");
    const [ chatMessages, setChatMessages ] = useState<ChatMessage[]>([]);
    const [ emotesExpanded, setEmotesExpanded ] = useState(false);
    const [ floatingEmotes, setFloatingEmotes ] = useState<EmoteData[]>([]);

    const isOwner = user && game?.owner.accountId === user?.identifier;

    const spawnEmote = (type: number) => {
        const id = Date.now() + Math.random();
      
        const left = Math.random() * 80 + 10;
        const bottom = Math.random() * 30 + 10;
        const drift = (Math.random() - 0.5) * 100;
        const rotation = (Math.random() - 0.5) * 60;
      
        const newEmote: EmoteData = { id, type, left, bottom, drift, rotation };
      
        setFloatingEmotes((prev) => [...prev, newEmote]);
      
        setTimeout(() => {
          setFloatingEmotes((prev) => prev.filter((e) => e.id !== id));
        }, 2500);
    };

    /**
     * First check to see if the game exists and perform a first render
     */
    useEffect(() => {
        fetch('/api/game', { method: 'GET' }).then(async res => handle<GamePageInitiatorValues>(
            res,
            (result) => {
                setGame(result);
                setPlayers((result?.players) ?? []);
            },
            (error) => {
                showPopup('error', error, 5.0);
                setGame(null);
            }
        ))
    }, []);

    /**
     * Establish a websocket connection
     */
    useEffect(() => {
        if(!game) return;

        // TODO : Get socket remote address from an environment constant or smth
        const socket = new WebSocket(`ws://127.0.0.1:8000/api/game/stateProvider`);
        socketRef.current = socket;

        const showError = (err: string) => showPopup('error', err, 5.0);
        socketHandlerRef.current = new ClientGameSocketHandler( socket, showError, setPlayers, setChatMessages, spawnEmote, setShowLeaderboard, setCurrentQuestion, setEnded, setAnswers, setTimerValue, setMyAnswer, setCorrectAnswer, setCurrentRank );

        return () => socket.close();
    }, [game, user]);

    /**
     * Animate the answer count everytime someone submits an answer
     */
    useEffect(() => {
        const el = answerCountRef.current;
        if (!el) return;
        el.classList.remove(styles.updated);
        void el.offsetWidth;
        el.classList.add(styles.updated);
    }, [answers.length]);

    if(loading || game === undefined) return <Loading />;
    if(game === null) { router.push('/'); return; }

    const playersWithoutSelf = players.slice();
    const selfIndex = playersWithoutSelf.findIndex(q => q.username === game.self.username);
    if(selfIndex >= 0) playersWithoutSelf.splice(selfIndex, 1);
    const sortedPlayers = players.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    
    return (
        <HeroPage className={styles.heroPage}>
        
        { /* Lobby Specific elements */ }
        { currentQuestion === undefined && 
            <div className={styles.lobbyContainer}>
                <div className={styles.pinContainer}>
                    <p className={styles.gamePin}>{game.id}</p>
                </div>

                <div className={styles.playersContainer}>
                    <h1>{players.length} player{players.length > 1 ? 's' : ''}</h1>
                    <div className={styles.playersList}>
                        { !isOwner && <div className={styles.selfPlayerCard}>{game.self.username}</div> }
                        {(isOwner ? players : playersWithoutSelf).map((gamePlayer, idx) => (
                            <div key={idx} className={styles.playerCard}>{gamePlayer.username ?? "N/A"}</div>
                        ))}
                    </div>
                </div>

                <div className={styles.chatWrapper}>
                    <div className={styles.chatContainer}>
                        {chatMessages.map((msg, idx) => (
                            <p key={idx}><strong>{msg.user?.username ?? "Anonymous"}</strong>: {msg.cnt}</p>
                        ))}
                    </div>
                    <form className={styles.messageForm}
                        onSubmit={(e) => {
                            e.preventDefault();
                            socketHandlerRef.current?.sendChatMessagePacket(chatInput);
                            setChatInput("");
                        }}
                    >
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type your message..."
                            className={styles.inputMessage}
                        />
                        <button type="submit" className={styles.sendMessage}>Send</button>
                    </form>
                </div>

                { isOwner && <button className={styles.actionButton} onClick={() => socketHandlerRef.current?.startGame()}><ChevronRightIcon />Start</button> }
            </div>
        }

        { /* Question display. */ }
        { currentQuestion && !showLeaderboard && !isOwner && myAnswer !== undefined && 
            <h1><CheckCheck strokeWidth={4} width={24} height={24} /> Answer Submitted</h1>
        }
        { currentQuestion && !showLeaderboard &&
            <QuestionTimer editable={false} value={timerValue} />
        }
        { currentQuestion && !showLeaderboard && (isOwner || myAnswer === undefined) &&
            renderInGame(currentQuestion, (answer) => {
                // TODO : Change the view to show the user already has answered
                setMyAnswer(answer);
                socketHandlerRef.current?.submitAnswer(answer);
            })
        }

        { /* Leaderboard display */}
        { currentQuestion && showLeaderboard &&
            <>
                { /* Show correction */ }
                { correctAnswer !== undefined && 
                    <div className={`${styles.correctAnswerDisplay} ${(isOwner || myAnswer === correctAnswer) ? styles.correct : styles.incorrect}`}>
                        {!isOwner && <h1>{(myAnswer && myAnswer === correctAnswer) ? 'Amazing' : 'Woopsie !'}</h1>}
                        { isOwner && <h1>Correct Answer</h1>}
                        
                        {myAnswer && myAnswer !== correctAnswer ? (
                            <div>
                                <p className={`${styles.incorrectAnswer}`}>{currentQuestion.children[myAnswer].get('label')}</p>
                                <p className={`${styles.correctAnswer}`}>{currentQuestion.children[correctAnswer].get('label')}</p>
                            </div>
                        ) : (
                            <p>{currentQuestion.children[correctAnswer].get('label')}</p>
                        )}
                    </div>
                }

                { /* Show leaderboard */ }
                { currentRank !== undefined && currentRank > -1 && 
                    <div className={styles.rankDisplay}>
                        <h1>You are #{currentRank + 1} with {sortedPlayers[currentRank].points ?? 0} points</h1>
                    </div>
                }
                <div className={styles.leaderboardDisplay}>
                    { 
                        sortedPlayers.slice(0, 8).map((p, idx) => {
                            let rankClass = '';
                            if (idx === 0) rankClass = styles.gold;
                            else if (idx === 1) rankClass = styles.silver;
                            else if (idx === 2) rankClass = styles.bronze;
                            else rankClass = styles.regular;
                            
                            return (
                                <div key={idx} className={rankClass}>
                                    <span>{p.username}</span>
                                    <span className={styles.points}>{p.points ?? 0}</span>
                                </div>
                            );
                        })
                    }
                </div>
                { /* Continue button */ }
                { isOwner && !ended && <button className={styles.actionButton} onClick={() => socketHandlerRef.current?.nextQuestion()}><ChevronRightIcon />Next Question</button> }
                { /* Home button */ }
                { isOwner && ended && <button className={styles.actionButton} onClick={() => router.push('/account')}><X /> Finish</button> }
                { !isOwner && ended && <button className={styles.actionButton} onClick={() => router.push('/')}><Home style={{strokeWidth: '3px'}}/> Home</button> }
            </>
            
        }

        {isOwner && currentQuestion && !showLeaderboard && 
        <>
            <div ref={answerCountRef} className={`${styles.answerStatus} ${styles.updated}`}>
                <Users />
                <p className={styles.answerCount}>
                    {answers.length} / {players.length}
                </p>
            </div>
            <button className={styles.actionButton} onClick={() => socketHandlerRef.current?.stopEarly()}><X />Show Results</button>
        </>
        }

        { /* Constant accross all views */ }
        <div
            className={`${styles.emoteButtons} ${emotesExpanded ? styles.expanded : ''}`}
            onClick={() => setEmotesExpanded(prev => !prev)}
        >
            { !emotesExpanded && <span>{getEmoteIcon(0)}</span> }

            <div className={styles.emoteButtonList}>
            {emoteChars.map((emote, i) => (
                <button
                key={emote}
                onClick={(e) => {
                    e.stopPropagation();
                    socketHandlerRef.current?.sendEmote(i);
                }}
                className={styles.emoteButton}
                >
                {emote}
                </button>
            ))}
            </div>
        </div>

        <FloatingEmotes floatingEmotes={floatingEmotes} getEmoteIcon={getEmoteIcon}/>
        </HeroPage>
    );
};

const GamePage = () => {
    return (
        <AuthProvider>
            { /* ContextMenuProvider isn't actually needed here, but bad design throws an error due to it being needed in the editor. It won't change anything though so it's fine for now */ }
            { /* TODO Later: Improve architecture to remove this */ }
            <ContextMenuProvider>
                <GamePageContent />
            </ContextMenuProvider>
        </AuthProvider>
    );
};

export default GamePage;