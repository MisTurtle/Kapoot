import { FC } from "react";
import styles from "./ActionButton.module.scss";

type ActionButtonProps = {
    theme?: "default" | "error" | "warn" | "success";
} & React.HTMLAttributes<HTMLButtonElement>;

const ActionButton: FC<ActionButtonProps> = ({ theme, onClick, children }) => {
    return <button className={styles.button} data-theme={theme ?? "default"} onClick={onClick}>{ children }</button>;
};

export default ActionButton;
