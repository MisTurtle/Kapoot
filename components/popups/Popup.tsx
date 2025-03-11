import { FC, useEffect, useState } from "react";
import { LucideIcon, X, CircleAlertIcon, CircleCheck, TriangleAlertIcon } from "lucide-react";
import styles from './Popup.module.scss';

type PopupProps = {
    message: string;  // Popup message
    color: number[];  // Popup color (RGB)
    icon: LucideIcon,  // Icon to show
    duration: number,  // Popup lifetime (in seconds)
    onClose: () => void
}

export const Popup: FC<PopupProps> = ({ message, color, icon: IconComponent, duration, onClose }) => {

    useEffect(() => {
        const timer = setTimeout(onClose, duration * 1000);
        return () => clearTimeout(timer);
    }, [ duration ]);

    const cssVar = { '--color': color } as React.CSSProperties; 
    return (
        <div className={styles.popup} style={cssVar}>
            <IconComponent className={styles.icon} />
            <p>{ message }</p>
            <button onClick={onClose}>
                <X />
            </button>
        </div>
    );

};

export type TypedPopupProps = {
    message: string;  // Popup message
    duration: number;  // Popup lifetime (in seconds)
    onClose: () => void;
};

export const ErrorPopup: FC<TypedPopupProps> = ({ message, duration, onClose }) => {
    return <Popup message={message} color={[235, 75, 75]} icon={CircleAlertIcon} duration={duration} onClose={onClose} />
};

export const WarningPopup: FC<TypedPopupProps> = ({ message, duration, onClose }) => {
    return <Popup message={message} color={[235, 211, 75]} icon={TriangleAlertIcon} duration={duration} onClose={onClose} />
};

export const SuccessPopup: FC<TypedPopupProps> = ({ message, duration, onClose }) => {
    return <Popup message={message} color={[83, 235, 75]} icon={CircleCheck} duration={duration} onClose={onClose} />
};

