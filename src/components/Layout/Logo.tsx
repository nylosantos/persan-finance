import React from "react";
import { useNavigate } from "react-router-dom";

export const Logo: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            className="flex items-center gap-2 select-none py-2 cursor-pointer"
            onClick={() => navigate("/")}
            style={{ minWidth: 0 }}
            aria-label="Ir para a página inicial"
        >
            <img
                src="/pwa_icons/icon-512x512.png"
                alt="Logo Persan Finance"
                className="w-10 h-10 rounded-lg object-cover"
                draggable={false}
            />
            <span
                className="font-bold text-lg text-gray-900 dark:text-gray-100 whitespace-nowrap
                    hidden xs:inline sm:inline md:inline lg:inline xl:inline
                    transition
                "
            >
                Persan Finance
            </span>
        </div>
    );
};