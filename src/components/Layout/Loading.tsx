export default function Loading() {
    return (
        <div className='flex w-full h-[50vh] items-center justify-center gap-3'>
            <span className="inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Carregando...</span>
        </div>
    );
}