import { Trash2Icon } from "lucide-react";
import styles from "./Delete.module.scss";
import { ButtonHTMLAttributes } from "react";


const DeleteButton = ({ callback, className }: { callback: () => any } & React.HTMLAttributes<HTMLButtonElement>) => {
    return (
        <button className={`${styles.delete} ${className} || ''`} onClick={callback}>
            <Trash2Icon width={20} strokeWidth={2} color="#000000b0" />
        </button>
    );
}

export default DeleteButton;
