import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { FC } from 'react';
import { LucideIcon, Home, UserPen, UserPlus, User } from 'lucide-react';

/* Resource file imports */
import styles from './NavBar.module.scss';
import logo from '../public/images/Logo_Big.png';


export interface NavLink {
  label: string; // Text to display when hovered 
  href: string; // where to redirect the user when clicked
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
  return (
    <nav className={styles.navContainer}>

      { /* Navigation Logo */ }
      <div className={styles.logoContainer}>
        <Link href='/' className={styles.logoLink}>
          <Image src={logo} className={styles.logo} alt="Page Logo" />
        </Link>
      </div>

      { /* Navigation Links */}
      <ul className={styles.linkContainer}>
        { links.map( ({ label, href, icon: IconComponent }) => (

            <li key={href} className={styles.linkListItem}>
              <Link href={href} className={styles.link}>
                <IconComponent className={styles.icon} />
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
        
        ))}
      </ul>

    </nav>
  );
};

export const NavBarSignedOut = () => {
  const links = [
    { label: "Home", href: "/", icon: Home },
    { label: "Sign In", href: "/login?page=sign", icon: UserPen },
    { label: "Register", href: "/login?page=register", icon: UserPlus }
  ];

  return <CustomNavBar logo={logo} links={links} />;
};

export const NavBarSignedIn = () => {
  const links = [
    { label: "Home", href: "/", icon: Home },
    { label: "Account", href: "/account", icon: User }
  ];

  return <CustomNavBar logo={logo} links={links} />;
}

// TODO : Use this once utilities for user account retrieval have been made (Adding user account fetching here would make useless requests)
export const NavBarAuto: FC<AutoNavBarProps> = ( { user } ) => {
  if(!user) return <NavBarSignedOut />;
  return <NavBarSignedIn />;
};
