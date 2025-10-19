import CardNav from './CardNav';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import type { FC } from 'react';

const Header: FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  

  const showGetStartedButton = location.pathname === '/' || location.pathname === '/home';

  const navItems = [
    {
      label: t('header.products'),
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: t('header.planningTools'), href: '/operation', ariaLabel: t('header.planningToolsAria') },
        { label: t('header.plannedFeatures'), href: 'https://rickrolllol.yourwebsitespace.com/', ariaLabel: t('header.plannedFeaturesAria') }
      ]
    },
    {
      label: t('header.resources'),
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: t('header.documentation'), href: 'https://github.com/jonaswvuwall/OnlyPlans/wiki', ariaLabel: t('header.documentationAria') },
        { label: t('header.support'), href: '/support', ariaLabel: t('header.supportAria') }
      ]
    },
    {
      label: t('header.company'),
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: 'Jonas Wintrich', href: 'https://www.linkedin.com/in/jonas-wintrich-a31bb61ba/', ariaLabel: t('header.jonasLinkedInAria') },
        { label: 'Benjamin Klein', href: 'https://www.linkedin.com/in/benjamin-klein-549906336/', ariaLabel: t('header.benjaminLinkedInAria') }
      ]
    }
  ];

  const navItemsWithGetStarted = showGetStartedButton 
    ? [
        ...navItems,
        {
          label: t('header.getStarted'),
          bgColor: '#8B5CF6',
          textColor: '#ffffff',
          links: [
            { label: t('header.startPlanning'), href: '/operation', ariaLabel: t('header.startPlanningAria') }
          ]
        }
      ]
    : navItems;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="w-full pt-4 pb-4 px-4">
        <CardNav
          logo="/Logo_small-Photoroom.png"
          logoAlt={t('header.logoAlt')}
          items={navItemsWithGetStarted}
          baseColor="#D3D3D3"
          menuColor="#333333"
          buttonBgColor="#8B5CF6"
          buttonTextColor="#ffffff"
        />
      </div>
    </header>
  );
};

export default Header;