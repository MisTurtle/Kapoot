import ContextMenu from "@components/popups/ContextMenu";
import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";

type ContextMenuContextType = {
    menuLock: any | null;
    openMenu: (lock: any, contents: ReactNode[], pos?: {x: number; y: number}) => void;
    closeMenu: () => void;
    menuPosition?: { x: number; y: number };
};

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export const ContextMenuProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [menuLock, setMenuLock] = useState<any | null>(null);
    const [menuPosition, setMenuPosition] = useState<{x: number; y: number}>({x: 0, y: 0});
    const [menuContents, setMenuContents] = useState<ReactNode[]|null>(null);

    const openMenu = (lock: any, contents: ReactNode[], pos?: {x: number; y: number}) => {
        setMenuLock(lock);
        setMenuContents(contents);
        if(pos) setMenuPosition(pos);
    };
    const closeMenu = () => setMenuLock(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if(!(e.target as HTMLElement).closest("[data-context-menu]"))
                setMenuLock(null);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <ContextMenuContext.Provider value={{ menuLock, menuPosition, openMenu, closeMenu }}>
            { children }
            { menuLock && <ContextMenu posX={menuPosition.x} posY={menuPosition.y}>
                {menuContents}
            </ContextMenu>
            }
        </ContextMenuContext.Provider>
    );
};

export const useContextMenu = () => {
    const context = useContext(ContextMenuContext);
    if (!context) throw new Error("useContextMenu must be used within a ContextMenuProvider");
    return context;
};
