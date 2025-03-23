import { FC } from "react";
import styles from "./ContextMenu.module.scss";


type ContextMenuProps = {
    posX: number;
    posY: number;
} & React.HTMLAttributes<HTMLDivElement>;

const ContextMenu: FC<ContextMenuProps> = ({ posX, posY, children }) => {
    return (
        <div className={`${styles.contextMenu} contextMenu`} style={ { top: `${posY}px`, left: `${posX}px` } } data-context-menu>
            { children }
        </div>
    );
};

export default ContextMenu;
