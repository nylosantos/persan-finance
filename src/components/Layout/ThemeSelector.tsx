import { useEffect, useState } from "react";

export default function ThemeSelector() {
    const [darkMode, setDarkMode] = useState(false);

    // Detecta o tema padrão do dispositivo
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);
    }, []);

    // Alterna entre os temas
    const toggleTheme = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark', !darkMode);
    };
    return (
        <div
            onClick={toggleTheme}
            className="flex items-center gap-4 px-4 py-2 bg-gray-300 dark:bg-gray-800 hover:bg-gray-300/60 dark:hover:bg-gray-800/60 text-gray-800 dark:text-gray-200 rounded-lg shadow-md cursor-pointer transition duration-200"
        >
            <p>
                {darkMode ? '🌙' : '☀️'}
            </p>
            <p>
                {darkMode ? 'Dark' : 'Light'}
            </p>
        </div>
    );
}