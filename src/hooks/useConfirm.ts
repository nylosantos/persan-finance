// src/hooks/useConfirm.ts
// Hook para exibir diálogos de confirmação e executar ações assíncronas com feedback

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const ReactSwal = withReactContent(Swal);

export interface ConfirmOptions {
    title: string;
    text: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    /** Mensagem de sucesso após confirmação */
    successMessage?: string;
    /** Mensagem de erro em caso de falha */
    errorMessage?: string;
}

/**
 * useConfirm: retorna uma função que mostra modal de confirmação,
 * executa ação assíncrona e mostra loading + feedback.
 * Uso:
 * const confirm = useConfirm();
 * await confirm({
 *   title: 'Delete',
 *   text: 'Confirm deletion?',
 *   onConfirm: () => api.delete(...),
 *   successMessage: 'Deleted successfully!',
 *   errorMessage: 'Failed to delete.'
 * });
 */
export function useConfirm() {
    return async (options: ConfirmOptions & { onConfirm: () => Promise<any> }) => {
        const { title, text, confirmButtonText, cancelButtonText, successMessage, errorMessage, onConfirm } = options;
        const result = await ReactSwal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: confirmButtonText || 'Confirm',
            cancelButtonText: cancelButtonText || 'Cancel',
            reverseButtons: true,
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !ReactSwal.isLoading(),
            preConfirm: () => onConfirm().catch(err => {
                ReactSwal.showValidationMessage(errorMessage || err.message);
                throw err;
            }),
        });

        if (result.isConfirmed) {
            await ReactSwal.fire({
                title: successMessage || 'Success',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            return true;
        }
        return false;
    };
}
