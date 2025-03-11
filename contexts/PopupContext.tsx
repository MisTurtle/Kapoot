import { createContext, useState, ReactNode, useContext, FC } from 'react';
import { ErrorPopup, Popup, SuccessPopup, TypedPopupProps, WarningPopup } from '@components/popups/Popup';
import styles from './PopupContainer.module.scss';


/* Create types */
const PopupClasses = {
    error: ErrorPopup,
    warn: WarningPopup,
    success: SuccessPopup
} as const;
type PopupType = keyof typeof PopupClasses;
type PopupData = TypedPopupProps & { 
    type: PopupType,  // Popup type to identify which component to render
    identifier: number  // Identifier to keep track of which components to delete
};


/* Create context */
type PopupContextType = {
    showPopup: (type: PopupType, message: string, duration: number) => Promise<void>;
}
const PopupContext = createContext<PopupContextType | undefined>(undefined);

/* Create provider */
export const PopupProvider = ( { children } : { children: ReactNode }) => {
    
    const [popups, setPopups] = useState<PopupData[]>([]);

    const showPopup = async (type: PopupType, message: string, duration: number = 5) => {
        let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const onClose = () => removePopup(id);
        setPopups((prev) => [...prev, { identifier: id, type: type, message: message, duration: duration, onClose: onClose }]);
        setTimeout(onClose, duration * 1000);
    };
  
    const removePopup = (id: number) => {
        setPopups((prev) => prev.filter((popup) => popup.identifier !== id));
    };

    const TypedComponent = (type: PopupType): FC<TypedPopupProps> => {
        return PopupClasses[type] || ErrorPopup;
    };

    return <PopupContext.Provider value={{ showPopup }}>
        {children}
        { /* Build a list of stacking popups */ }
        <div className={styles.popupContainer}>  
            {popups.map(({ identifier, message, type, duration }) => {
            const PopupComponent = TypedComponent(type); // Dynamically get the correct component
            return (
                <PopupComponent
                key={identifier}
                message={message}
                duration={duration}
                onClose={() => removePopup(identifier)}
                />
            );
            })}
        </div>
    </PopupContext.Provider>
};

/**
 * I think this triggers asynchronous calls causing race condition if multiple popups are created at the exact same time
 */
export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) throw new Error("usePopup must be used within a PopupProvider");
    return context;
};
