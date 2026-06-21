import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, BookOpen, Github, CloudUpload } from 'lucide-react';
import { cn } from '../../lib/utils';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: true },
  { to: '/demo-dashboard', icon: CloudUpload, label: 'Demo' },
  { to: '/docs', icon: BookOpen, label: 'Docs' },
  { to: 'https://github.com/mahendra0011/CloudNest.git', icon: Github, label: 'GitHub', external: true },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
      <div className="flex items-center justify-around py-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = !link.external && location.pathname === link.to;
          return link.external ? (
            <a
              key={link.label}
              href={link.to}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{link.label}</span>
            </a>
          ) : (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1',
                isActive ? 'text-gd-blue' : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-gd-blue')} />
              <span className={cn('text-[10px] font-medium', isActive && 'text-gd-blue')}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
