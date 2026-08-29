import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
      <h1 className="text-6xl font-bold text-emerald-400 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-full transition-colors"
      >
        Volver al Inicio
      </Link>
    </div>
  );
}
