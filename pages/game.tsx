// TODO : Check if the user is in game (admin or player). If not, redirect to the home page

import ClientGameSocketHandler from "@client/client_game_socket_handler";
import { handle } from "@common/responses";
import Loading from "@components/misc/Loading";
import { AuthProvider, useAuth } from "@contexts/AuthContext";
import { usePopup } from "@contexts/PopupContext";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styles from './game.module.scss';
import FloatingEmotes from "@components/misc/FloatingEmotes"
import { emoteChars, getEmoteIcon } from "@client/utils";


const GamePageContent = () => {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { showPopup } = usePopup();

    const socketRef = useRef<WebSocket | undefined>(undefined);
    const socketHandlerRef = useRef<ClientGameSocketHandler | null>(null);

    const [ game, setGame ] = useState<SharedGameValues | undefined | null>();
    const [ players, setPlayers ] = useState<GamePlayer[]>([]);
    const [ chatMessages, setChatMessages ] = useState<ChatMessage[]>([]);

    const [ chatInput, setChatInput ] = useState("");

    const isOwner = user && game?.owner.accountId === user?.identifier;
    const [floatingEmotes, setFloatingEmotes] = useState<EmoteData[]>([]);

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

    useEffect(() => {
        fetch('/api/game', { method: 'GET' }).then(async res => handle<SharedGameValues>(
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

    useEffect(() => {
        if(!game) return;

        // TODO : Get socket remote address from an environment constant or smth
        const socket = new WebSocket(`ws://127.0.0.1:8000/api/game/stateProvider`);
        socketRef.current = socket;

        const showError = (err: string) => showPopup('error', err, 5.0);
        socketHandlerRef.current = new ClientGameSocketHandler( socket, showError, setPlayers, setChatMessages, spawnEmote );

        return () => socket.close();
    }, [game, user]);

    if(loading || game === undefined) return <Loading />;
    if(game === null) { router.push('/'); return; }

    return (
        <>
        <div className={styles.lobbyContainer}>
            {isOwner ? <p>You are the owner of Game #{game!.id}</p> : <p>You are a player in Game #{game!.id}</p>}

            <div className={styles.playersContainer}>
                <span className={styles.playerTitle}>Player{players.length > 1 ? 's' : ''} in game</span>
                <div className={styles.playersList}>
                {players.map(gamePlayer => (
                    <span key={gamePlayer.accountId} className={styles.playerUsername}>{gamePlayer.username ?? "N/A"}</span>
                ))}
                </div>
            </div>

            <h2>Chat:</h2>
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

            <div className={styles.emoteButtons}>
                <p>Send an emote:</p>
                <div className={styles.emoteButtonList}>
                {emoteChars.map((emote, i) => (
                    <button key={emote} onClick={() => {socketHandlerRef.current?.sendEmote(i); }} className={styles.emoteButton}>{emote}</button>
                ))}
                </div>
            </div>

            <FloatingEmotes floatingEmotes={floatingEmotes} getEmoteIcon={getEmoteIcon}/>
        </div>
        </>
    );
};

const GamePage = () => {
    return (
        <AuthProvider>
            <GamePageContent />
        </AuthProvider>
    );
};

export default GamePage;