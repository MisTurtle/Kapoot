// TODO : Check if the user is in game (admin or player). If not, redirect to the home page

import { handle } from "@common/responses";
import Loading from "@components/misc/Loading";
import { ProtectedRoute } from "@components/wrappers/ProtectedRoute";
import { AuthProvider, useAuth } from "@contexts/AuthContext";
import { usePopup } from "@contexts/PopupContext";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const GamePageContent = () => {
    const router = useRouter();
    const [ game, setGame ] = useState<SharedGameValues | undefined | null>();
    const socketRef = useRef<WebSocket | undefined>(undefined);

    const { user, loading } = useAuth();
    const { showPopup } = usePopup();
    const isOwner = user && game?.owner.accountId === user?.identifier;

    useEffect(() => {
        fetch('/api/game', { method: 'GET' }).then(async res => handle<SharedGameValues>(
            res,
            (result) => {
                console.log(result);
                setGame(result);
            },
            (error) => {
                showPopup('error', error, 5.0);
                setGame(null);
            }
        ))
    }, []);

    useEffect(() => {
        if(!game || !user) return;

        // TODO : Get socket remote from an environment constant or smth
        const socket = new WebSocket(`ws://localhost:8000/api/game/stateProvider`);
        socketRef.current = socket;

        socket.onmessage = (event) => {
            // const message = JSON.parse() // TODO
        };

    }, [game, user]);

    if(loading || game === undefined) return <Loading />;
    if(game === null) { router.push('/'); return; }

    let cnt;
    if(isOwner) cnt = <p>You are the owner of Game #{game!.id}</p>;
    else cnt = <p>You are a player in Game #{game!.id}</p>;

    return (
        <>
            { cnt }
            { /* TODO : Player card component */ }
            {
                game?.players.map(gamePlayer => (
                    <p>{gamePlayer.username ?? "N/A"}</p>
                ))
            }
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