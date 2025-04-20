import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { handle } from "@common/responses";
import { usePopup } from "@contexts/PopupContext";
import { randomIGN } from "@server/utils/ign";
import styles from "./create-username.module.scss";
import HeroPage from "@components/wrappers/HeroPage";

const EnterUsername = () => {
    const router = useRouter();
    const { showPopup } = usePopup();
    const [code, setCode] = useState<string | undefined>(undefined);
    const [username, setUsername] = useState<string>("");

    const random_username = randomIGN();

    useEffect(() => {
        if (router.query.gamecode) {
            setCode(router.query.gamecode as string);
        }
    }, [router.query.gamecode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const user_name = username.trim() === "" ? random_username : username;

        if (!code) return;

        const res = await fetch(`/api/game/${code}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: user_name }),  
        }).then(async res => handle(
            res,
            (result) => {
                showPopup('success', 'Successfully joined the game !', 5.0);
                router.push('/game');
            },
            (error) => {
                showPopup('error', error, 5.0);
            }
        ));
    };

    return (
        <HeroPage className={styles.heroContent}>
        <form className={styles.codeInput} onSubmit={handleSubmit}>
            <span className={styles.title}>ENTER YOUR PSEUDONYM</span>
            <input className={styles.enterCode}
                type="text"
                value={username}  
                onChange={(e) => setUsername(e.target.value)} 
                placeholder={random_username}  
            />
            <button className={styles.startButton} type="submit">Join the game</button>
        </form>
        </HeroPage>
    );
};

export default EnterUsername;
