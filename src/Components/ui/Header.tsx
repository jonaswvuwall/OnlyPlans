import CardNav from './CardNav';
import { useLocation } from 'react-router-dom';
import type { FC } from 'react';

const Header: FC = () => {
  const location = useLocation();
  
  // Determine if we should show the Get Started button (only on landing page)
  const showGetStartedButton = location.pathname === '/' || location.pathname === '/home';

  // CardNav data
  const navItems = [
    {
      label: 'Products',
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: 'Planning Tools', href: '/operation', ariaLabel: 'Go to Planning Tools' },
        { label: 'Planned Features', href: 'https://rickrolllol.yourwebsitespace.com/', ariaLabel: 'Go to Planned Features' }
      ]
    },
    {
      label: 'Resources',
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: 'Documentation', href: 'https://github.com/jonaswvuwall/OnlyPlans/wiki', ariaLabel: 'Go to Documentation' },
        { label: 'Support', href: '/https://www.support.com/', ariaLabel: 'Go to Support' }
      ]
    },
    {
      label: 'Company',
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: 'Jonas Wintrich', href: 'https://www.linkedin.com/in/jonas-wintrich-a31bb61ba/', ariaLabel: 'Go to Jonas Wintrich LinkedIn' },
        { label: 'Benjamin Klein', href: 'https://www.linkedin.com/in/benjamin-klein-549906336/', ariaLabel: 'Go to Benjamin Klein LinkedIn' }
      ]
    }
  ];

  // Add Get Started button to navigation if requested (for landing page)
  const navItemsWithGetStarted = showGetStartedButton 
    ? [
        ...navItems,
        {
          label: 'Get Started',
          bgColor: '#8B5CF6',
          textColor: '#ffffff',
          links: [
            { label: 'Start Planning', href: '/operation', ariaLabel: 'Go to Planning Tools' }
          ]
        }
      ]
    : navItems;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="w-full pt-4 pb-4 px-4">
        <CardNav
          logo="/Logo_small-Photoroom.png"
          logoAlt="OnlyPlans Logo"
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