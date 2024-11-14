import { Link } from 'react-router-dom'
import { CenteredFooter } from '@/features/landing/CenteredFooter';
import { Section } from '@/features/landing/Section';
import { AppConfig } from '@/utils/AppConfig';
import { Logo } from './Logo';
import { InstagramLogoIcon } from '@radix-ui/react-icons';


export const Footer = () => {
  return (
    <Section className="pb-16 pt-0">
      <CenteredFooter
        logo={<Logo />}
        name={AppConfig.name}
        iconList={(
          <>
            <li>
              <Link to="https://www.facebook.com/profile.php?id=100054522636812" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/>
                </svg>
              </Link>
            </li>

            <li>
              <Link to="https://instagram.com/capturethemoment_adl" aria-label="Instagram">
                <InstagramLogoIcon className="size-5" />
              </Link>
            </li>
          </>
        )}
      >
        <li>
          <Link to="/login">Sign In</Link>
        </li>
      </CenteredFooter>
    </Section>
  );
};