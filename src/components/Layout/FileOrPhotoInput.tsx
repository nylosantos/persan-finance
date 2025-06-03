// File: FileOrPhotoInput.tsx
import React, { useRef } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import { useConfirm } from '../../hooks/useConfirm';

interface FileOrPhotoInputProps {
    file: File | null;
    setFile: (file: File | null) => void;
    labelFile?: string;
    labelPhoto?: string;
    required?: boolean;
}

export const FileOrPhotoInput: React.FC<FileOrPhotoInputProps> = ({
    file,
    setFile,
    labelFile = "Selecionar arquivo",
    // labelPhoto = "Tirar foto",
    required = false,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const confirm = useConfirm();

    // Detecta mobile (pointer:coarse cobre touch devices)
    const isMobile = typeof window !== "undefined" && window.matchMedia('(pointer:coarse)').matches;

    // Handler genérico para troca de arquivo/foto
    const handleSelect = async (type: 'file' | 'photo') => {
        if (file) {
            const ok = await confirm({
                title: 'Trocar arquivo?',
                text: 'Já existe um arquivo selecionado. Se continuar, o arquivo atual será removido. Deseja prosseguir?',
                confirmButtonText: 'Trocar',
                cancelButtonText: 'Cancelar',
                onConfirm: async () => Promise.resolve(),
            });
            if (!ok) return;
            setFile(null);
            setTimeout(() => {
                if (type === 'file') fileInputRef.current?.click();
                else photoInputRef.current?.click();
            }, 100);
        } else {
            if (type === 'file') fileInputRef.current?.click();
            else photoInputRef.current?.click();
        }
    };

    return (
        <div className="flex gap-2 items-center justify-center mt-4">
            {/* Input para arquivo */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                required={required && !file}
                onChange={e => setFile(e.target.files?.[0] || null)}
                id="file-input"
            />
            <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded border bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                onClick={() => handleSelect('file')}
            >
                <FaFileAlt />
                {labelFile}
            </button>

            {/* Input para foto (apenas mobile) */}
            {isMobile && (
                <>
                    {/* <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        required={required && !file}
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        id="photo-input"
                    />
                    <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-2 rounded border bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        onClick={() => handleSelect('photo')}
                    >
                        <FaCamera />
                        {labelPhoto}
                    </button> */}
                </>
            )}

            {/* Mostra nome do arquivo selecionado */}
            {file && (
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-200 truncate max-w-[180px]">
                    {file.name}
                </span>
            )}
        </div>
    );
};