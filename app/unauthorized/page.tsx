
export default function unauthorizedPage() {
    return (
        <div className="flex flex-col justify-center items-center bg-white min-h-screen w-full">
            <h1 className="text-lg text-black font-bold">403 - Acesso negado</h1>
            <h2 className="text-black/70 font-bold">Você não tem permissão para acessar essa página</h2>
        </div>
    )
}