import type { FC } from 'react';
import { useState } from 'react';

const UserSidebar: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Placeholder user data
  const user = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    avatar: '/Logo_PNG_Tiny.PNG',
  };

  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-white/10 backdrop-blur-md border-l border-white/20 flex flex-col z-40 shadow-lg">
      <div className="flex flex-col items-center py-8 gap-8 flex-1 w-full">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-20 h-20 rounded-full border-4 border-white/20 mb-4 object-cover"
        />
        <div className="text-center">
          <div className="text-white text-lg font-semibold">{user.name}</div>
          <div className="text-white/60 text-xs">{user.email}</div>
        </div>
      </div>
      {/* Settings menu at the bottom */}
      <div className="w-full px-4 pb-8 mt-auto">
        <div className="relative flex flex-col items-end">
          <button
            className="w-full flex items-center justify-between bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-xs hover:bg-white/20 transition"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <span>Einstellungen</span>
            <svg className={`w-4 h-4 ml-2 transform rotate-180 transition-transform duration-200 ${menuOpen ? 'rotate-0' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 left-0 bottom-12 mb-2 bg-white/20 border border-white/30 rounded-lg shadow-lg z-50 animate-fadeIn">
              <button className="block w-full text-left px-4 py-2 text-white text-xs hover:bg-white/30 transition">Profil bearbeiten</button>
              <button className="block w-full text-left px-4 py-2 text-white text-xs hover:bg-white/30 transition">Passwort ändern</button>
              <button className="block w-full text-left px-4 py-2 text-white text-xs hover:bg-white/30 transition">Abmelden</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;
