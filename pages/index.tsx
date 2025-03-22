import React from "react";
import Link from "next/link";
import { AuthProvider, useAuth } from "@contexts/AuthContext";
import { useRouter } from "next/router";
import { usePopup } from "@contexts/PopupContext";
import { handle } from "@common/responses";
import styles from "./index.module.scss";

import { UserNavBar } from "@components/NavBar";
import HeroPage from "@components/wrappers/HeroPage"; // Import the Hero Background Component
import HeroLogo from "@components/misc/HeroLogo";

const IndexContent = () => {
  const router = useRouter();
  const { showPopup } = usePopup();
  const { user } = useAuth();

  const createQuizz = () => {
    if (!user) {
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

  return (
    <>
      <UserNavBar links={['logout']} />
      <HeroPage className={styles.heroContent}>
        <HeroLogo />
        <form className={styles.codeInput}>
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
