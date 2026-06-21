import React from 'react';
import { Link } from 'react-router-dom';
import { CloudUpload } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Footer({ className }) {
  return (
    <footer className={cn('border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950', className)}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gd-blue text-white">
              <CloudUpload className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 dark:text-white">
                Cloud<span className="text-gd-blue">Nest</span>
              </p>
              <p className="text-xs text-slate-500">Powered by Google Drive Storage</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link to="/docs" className="hover:text-gd-blue">Documentation</Link>
            <a href="#features" className="hover:text-gd-blue">Features</a>
            <a href="#pricing" className="hover:text-gd-blue">Pricing</a>
          </div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} CloudNest · MIT License</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
