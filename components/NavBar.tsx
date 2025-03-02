import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { FC } from 'react';
import { LucideIcon } from 'lucide-react';

/* Resource file imports */
import styles from './NavBar.module.scss';


export interface NavLink {
  label: string; // Text to display when hovered 
  href: string; // where to redirect the user when clicked
  icon: LucideIcon; // A lucide-react icon (An icon library)
}

interface NavBarProps {
  logo: string | StaticImageData; // URL to the logo image
  links: NavLink[];
}

const NavBar: FC<NavBarProps> = ({ logo, links }) => {
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
  )
};

export default NavBar;
