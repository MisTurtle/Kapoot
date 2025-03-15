import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { FC } from 'react';
import { LucideIcon, Home, UserPen, UserPlus, User, DoorClosedIcon } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';

/* Resource file imports */
import styles from './NavBar.module.scss';
import logo from '@public/images/Logo_Big.png';

// TODO : Ability to pass in some extra class to apply styles on specific buttons (copy Quizlet's layout ?)

export interface NavLink {
  label: string; // Text to display when hovered 
  target: string | (() => any); // Where to redirect the user when clicked (if a string is passed), or a javascript function to call
  icon: LucideIcon; // A lucide-react icon (An icon library)
}

interface NavBarProps {
  logo: string | StaticImageData; // URL to the logo image
  links: NavLink[];
}

interface AutoNavBarProps {
  user?: UserIdentifier; // Identifier to the current user
}

export const CustomNavBar: FC<NavBarProps> = ({ logo, links }) => {

  const handleClick = (target: string | (() => any)) => {
    if(typeof target === 'string') window.location.href = target;  // Redirect the user to the URL
    else if(typeof target === 'function') target();  // Call the JavaScript function
  };

  return (
    <nav className={styles.navContainer}>

      { /* Navigation Logo */ }
      <div className={styles.logoContainer}>
        <Link href='/' className={styles.logoLink}>
          <Image src={logo} className={styles.logo} alt="Page Logo" />
        </Link>
      </div>

      { /* Navigation Links */ }
      <ul className={styles.linkContainer}>
        { links.map( ({ label, target, icon: IconComponent }) => (

            <li key={label} className={styles.linkListItem}>
              <button className={styles.link} onClick={ () => handleClick(target) }>
                <IconComponent className={styles.icon} />
                <span className={styles.label}>{label}</span>
              </button>
            </li>
        
        ))}
      </ul>

    </nav>
  );
};

export const NavBarSignedOut = () => {
  const links = [
    { label: "Home", target: "/", icon: Home },
    { label: "Sign In", target: "/login?page=sign", icon: UserPen },
    { label: "Register", target: "/login?page=register", icon: UserPlus }
  ];

  return <CustomNavBar logo={logo} links={links} />;
};

const logoutCallback = () => {
  // TODO : Display confirmation prompt, somehow
  fetch("/api/account/logout", { 'method': 'POST' }).then(() => location.reload());
};

export const NavBarSignedIn = () => {
  const links = [
    { label: "Home", target: "/", icon: Home },
    { label: "Account", target: "/account", icon: User },
    { label: "Logout", target: logoutCallback, icon: DoorClosedIcon }
  ];

  return <CustomNavBar logo={logo} links={links} />;
}

// TODO : Use this once utilities for user account retrieval have been made (Adding user account fetching here would make useless requests)
export const NavBarAuto: FC<AutoNavBarProps> = ( ) => {
  const { user } = useAuth();

  if(!user) return <NavBarSignedOut />;
  return <NavBarSignedIn />;
};
