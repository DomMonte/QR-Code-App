import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';
import { Logo } from './Logo';

export const Navbar = () => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Section className="px-3 py-6">
      <CenteredMenu
        logo={<Logo />}
        rightMenu={(
          <>
            <li>
              <Link className={buttonVariants()} to="/login">
                Sign In
              </Link>
            </li>
          </>
        )}
      >
        <li>
          <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>
            Features
          </a>
        </li>
        <li>
          <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')}>
            Pricing
          </a>
        </li>
        <li>
          <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')}>
            FAQ
          </a>
        </li>
      </CenteredMenu>
    </Section>
  );
};