import ContextMenu from "@components/popups/ContextMenu";
import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";

type ContextMenuContextType = {
    menuLock: any | null;
    menuPosition: { x: number; y: number };
    openMenu: (lock: any, pos: {x: number; y: number}, contents: ReactNode[]) => void;
};

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export const ContextMenuProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [menuLock, setMenuLock] = useState<any | null>(null);
    const [menuPosition, setMenuPosition] = useState<{x: number; y: number}>({x: 0, y: 0});
    const [menuContents, setMenuContents] = useState<ReactNode[]|null>(null);

    const openMenu = (lock: any, pos: {x: number; y: number}, contents: ReactNode[]) => {
        setMenuLock(lock);
        setMenuPosition(pos);
        setMenuContents(contents);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            setMenuLock(null);
            console.log('clearing');
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <ContextMenuContext.Provider value={{ menuLock, menuPosition, openMenu }}>
            {children}
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
