import React from 'react';
import { Home, Shirt, Plus, ScanLine, User } from 'lucide-react';
import { AppView } from '../types';

interface NavBarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  const navItem = (view: AppView, Icon: React.ElementType, label: string, isMain = false) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setView(view)}
        className={`flex flex-col items-center justify-center transition-all duration-300 group ${
          isMain ? '-mt-10' : ''
        }`}
      >
        <div
          className={`${
            isMain
              ? 'w-16 h-16 bg-[#e08e79] text-white rounded-full shadow-lg shadow-[#e08e79]/40 flex items-center justify-center transform active:scale-95 transition-transform duration-300 ring-4 ring-[#FAFAFA]'
              : isActive
              ? 'text-[#e08e79] transform -translate-y-1'
              : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          <Icon size={isMain ? 32 : 22} strokeWidth={isMain ? 2.5 : (isActive ? 2.5 : 2)} />
        </div>
      </button>
    );
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/50 h-[80px] z-50 flex justify-between items-center px-8 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
      {navItem(AppView.HOME, Home, '首页')}
      {navItem(AppView.WARDROBE, Shirt, '衣橱')}
      {navItem(AppView.ADD, Plus, '录入', true)}
      {navItem(AppView.FAIR_PRICE, ScanLine, '识价')}
      {navItem(AppView.SETTINGS, User, '我的')}
    </div>
  );
};

export default NavBar;