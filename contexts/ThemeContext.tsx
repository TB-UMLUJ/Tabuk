import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

type Theme = 'light' | 'dark';

interface AppSettings {
    mainLogoUrl: string;
    headerLogoUrl: string;
    loginLogoUrl: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  logos: AppSettings;
}

const defaultLogos: AppSettings = {
    // Fallback logo used for welcome, and about screens if database fetch fails.
    mainLogoUrl: 'https://c.top4top.io/p_35899m4de1.png',
    // Fallback logo used for the main app header if database fetch fails.
    headerLogoUrl: 'https://i.ibb.co/7bQ07Pz/sgh-logo.png',
    // Fallback for login screen logo. Will be same as main logo by default.
    loginLogoUrl: 'https://c.top4top.io/p_35899m4de1.png',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme in localStorage, or system preference, or default to light
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) return savedTheme;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
  });
  
  const [logos, setLogos] = useState<AppSettings>(defaultLogos);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    /**
     * Fetches logo URLs from the 'logos' table in Supabase.
     * If the fetch is successful, it updates the application's logos.
     * If it fails or if specific logos are not found, it falls back to the defaultLogos
     * to ensure the application continues to function visually.
     */
    const fetchLogos = async () => {
        try {
            const { data, error } = await supabase.from('logos').select('name, image_url');
            if (error) {
                console.warn("Could not fetch logos from database, using default URLs.", error.message);
                return;
            }

            const fetchedLogos = { ...defaultLogos };
            if(data) {
                const mainLogo = data.find(l => l.name === 'main_logo');
                const headerLogo = data.find(l => l.name === 'header_logo');
                const loginLogo = data.find(l => l.name === 'health_holding');

                if (mainLogo?.image_url) {
                    fetchedLogos.mainLogoUrl = mainLogo.image_url;
                }
                if (headerLogo?.image_url) {
                    fetchedLogos.headerLogoUrl = headerLogo.image_url;
                }
                if (loginLogo?.image_url) {
                    fetchedLogos.loginLogoUrl = loginLogo.image_url;
                } else if (mainLogo?.image_url) {
                    // If health_holding logo is not found, fallback to main_logo for login.
                    fetchedLogos.loginLogoUrl = mainLogo.image_url;
                }
            }
            setLogos(fetchedLogos);
        } catch (e) {
            console.error("Error fetching logos:", e);
        }
    };

    fetchLogos();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, logos }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
