import Image from "next/image";

import logo from "@public/images/Logo_Big.png";
import styles from './HeroLogo.module.scss';

const HeroLogo = () => {
    return (
        <>
            <Image src={logo} className={styles.heroLogo} alt="Kapoot Logo" />
            <h1 className={styles.heroTitle}>Spice up your Quizz</h1>
        </>
    );
};

export default HeroLogo;