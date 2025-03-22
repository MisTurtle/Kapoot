import { FC } from 'react';
import { LucideIcon, Home, UserPen, UserPlus, User, DoorClosedIcon } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';

/* Resource file imports */
import styles from './NavBar.module.scss';


const logoutCallback = () => {
  fetch("/api/account/logout", { 'method': 'POST' }).then(() => location.reload());
};
export const knownElements: Record<string, NavLink> = {
  'home': { label: "Home", target: "/", icon: Home },
  'signIn': { label: "Sign In", target: "/login?page=sign", icon: UserPen },
  'signUp': { label: "Register", target: "/login?page=register", icon: UserPlus },
  'account': { label: "Account", target: "/account", icon: User },
  'logout': { label: "Logout", target: logoutCallback, icon: DoorClosedIcon }
}

export interface NavLink {
  label: string; // Text to display when hovered 
  target: string | (() => any); // Where to redirect the user when clicked (if a string is passed), or a javascript function to call
  icon: LucideIcon; // A lucide-react icon (An icon library)
}

interface NavBarProps {
  links?: (NavLink | keyof typeof knownElements)[];
}

export const CustomNavBar: FC<NavBarProps> = ({ links }) => {

  const handleClick = (target: string | (() => any)) => {
    if(typeof target === 'string') window.location.href = target;  // Redirect the user to the URL
    else if(typeof target === 'function') target();  // Call the JavaScript function
  };
  if(!links) links = [];
  const fetchedLinks = links.map(link => typeof link === 'string' ? knownElements[link] : link);

  return (
    <nav className={styles.navContainer}>

      { /* Navigation Links */ }
      { fetchedLinks.map( ({ label, target, icon: IconComponent }) => (
        <button key={label} className={styles.link} onClick={ () => handleClick(target) }>
          <IconComponent className={styles.icon} />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
      
    </nav>
  );
};

export const UserNavBar: FC<NavBarProps> = ({ links }) => {
  const { user } = useAuth();
  
  // Add Account or Sign In button
  if(!links) links = [];
  links.unshift(user ? 'account' : 'signIn');
  // Remove the logout button if the user isn't signed in
  const logoutIndex = links.indexOf('logout');
  if(logoutIndex !== -1 && !user) links.splice(logoutIndex, 1);

  return <CustomNavBar links={links} />
};
