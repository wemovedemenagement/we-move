/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  pathname: string;
  push: (url: string) => void;
  query: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  pathname: '/',
  push: () => {},
  query: {},
});

export const useRouter = () => useContext(RouterContext);

function normalizePath(path: string): string {
  if (!path) return '/';
  // Strip query string for path matching
  const [cleanPath] = path.split('?');
  let normalized = cleanPath;
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  if (!normalized.endsWith('/') && normalized !== '') {
    normalized = normalized + '/';
  }
  return normalized;
}

function parseQuery(url: string): Record<string, string> {
  const parts = url.split('?');
  if (parts.length < 2) return {};
  const params = new URLSearchParams(parts[1]);
  const res: Record<string, string> = {};
  params.forEach((value, key) => {
    res[key] = value;
  });
  return res;
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUrl, setCurrentUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return '/';
  });

  const pathname = normalizePath(currentUrl);
  const query = parseQuery(currentUrl);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const push = (url: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', url);
      setCurrentUrl(url);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <RouterContext.Provider value={{ pathname, push, query }}>
      {children}
    </RouterContext.Provider>
  );
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  className = '',
  activeClassName = '',
  onClick,
  ...rest
}) => {
  const { pathname, push } = useRouter();
  const normalizedTarget = normalizePath(href);
  const isActive = pathname === normalizedTarget || (normalizedTarget !== '/' && pathname.startsWith(normalizedTarget));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    // Don't intercept if modified click (cmd, ctrl, shift, or middle click)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    push(href);
  };

  const combinedClass = `${className} ${isActive ? activeClassName : ''}`.trim();

  return (
    <a href={href} onClick={handleClick} className={combinedClass} {...rest}>
      {children}
    </a>
  );
};
