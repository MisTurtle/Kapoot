import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AuthProvider, useAuth } from "@contexts/AuthContext";
import { useRouter } from "next/router";
import { usePopup } from "@contexts/PopupContext";
import { handle } from "@common/responses";
import styles from "./index.module.scss";

import { NavLink, UserNavBar } from "@components/NavBar";
import HeroPage from "@components/wrappers/HeroPage"; // Import the Hero Background Component
import HeroLogo from "@components/misc/HeroLogo";
import { PlayCircleIcon } from "lucide-react";

const IndexContent = () => {
    const router = useRouter();
    const { showPopup } = usePopup();
    const { user } = useAuth();
    const [ canRejoin, setCanRejoin ] = useState(false);

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        var target: { value: number }[] = e.target as any;
        const pin = target[0].value;

        if(!user) {
            // Check the game exists before asking for a username
            fetch(`/api/game/${pin}`, { method: 'GET' })
            .then(async res => handle(
                res,
                (result) => router.push(`/create-username?gamecode=${target[0].value}`),
                (error) => showPopup('error', error, 5.0)
            ))
        }else{
            // Try to join directly
            fetch(`/api/game/${pin}`, { method: 'PUT' })
            .then(async res => handle(
                res,
                (result) => router.push('/game'),
                (error) => showPopup('error', error, 5.0)
            ));
        }
    };

    useEffect(() => {
        fetch("/api/game")
            .then(res =>
                handle(
                    res,
                    () => setCanRejoin(true),
                    () => {}
                )
            );
    }, []);

    const navLinks: (string | NavLink)[] = ['logout'];
    if(canRejoin) navLinks.push({ 'icon': PlayCircleIcon, 'label': 'Rejoin', 'target': () => router.push('/game') });

    return (
        <>
            <UserNavBar links={navLinks} />
            <HeroPage className={styles.heroContent}>
                <HeroLogo />
                <form className={styles.codeInput} onSubmit={handleSubmit}>
                    <input className={styles.enterCode} name="quizzId" placeholder="Code PIN du jeu" type="numeric" />
                    <button className={styles.startButton} type="submit">Validate</button>
                </form>
                <p className={styles.quizzCreateParagraph}>Want to create your own quizz? It's over <Link href="" onClick={createQuizz}>here</Link>!</p>
            </HeroPage>
        </>
    );
};

const IndexPage = () => {
    return (
        <AuthProvider>
            <IndexContent />
        </AuthProvider>
    );
};

export default IndexPage;
