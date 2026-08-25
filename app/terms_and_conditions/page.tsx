"use client";

import React from "react";
import LegalLayout from "@/components/LegalLayout";

export default function TermsAndConditionsPage() {
  return (
    <LegalLayout
      title="Términos y Condiciones"
      subtitle="Condiciones generales de uso para usuarios, organizadores y asistentes en la plataforma 4GO."
      activeTab="terms"
    >
      <div className="prose prose-zinc max-w-none space-y-6 text-sm sm:text-base">
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
          Última actualización: <span className="font-semibold text-zinc-900">25 de Agosto de 2026</span>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">1. Aceptación de los Términos</h2>
          <p>
            Al ingresar, registrarte o adquirir entradas a través de 4GO, aceptas quedar vinculado legalmente por los presentes Términos y Condiciones. Si no estás de acuerdo con alguna parte de estas condiciones, deberás abstenerte de utilizar la plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">2. Cuentas de Usuario y Autenticación</h2>
          <p>
            Al iniciar sesión mediante Google o registrarte en 4GO, garantizas que la información proporcionada es precisa y actualizada. Eres responsable de mantener la confidencialidad de tu cuenta y de las acciones realizadas desde la misma. Nos reservamos el derecho de suspender o cancelar cuentas en caso de uso ilícito o violación de estos términos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">3. Uso Aceptable del Servicio</h2>
          <p>Los usuarios se comprometen a utilizar la plataforma de acuerdo con la ley y a no realizar:</p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-700">
            <li>Reventa no autorizada o falsificación de pases y códigos QR de eventos.</li>
            <li>Uso de bots, automatizaciones o scripts para extracción masiva de datos o acaparamiento de entradas.</li>
            <li>Acceso no autorizado a sistemas informáticos, servidores o bases de datos de la plataforma.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">4. Propiedad Intelectual</h2>
          <p>
            Todos los elementos distintivos de la marca 4GO, logos, diseño de interfaz, software y contenido audiovisual están protegidos por derechos de propiedad intelectual. Queda prohibida la reproducción parcial o total sin consentimiento previo y por escrito.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">5. Limitación de Responsabilidad</h2>
          <p>
            4GO opera como intermediario tecnológico para la venta de entradas entre los organizadores de eventos/discotecas y los compradores. Salvo disposición legal en contrario, la responsabilidad del desarrollo, horarios y seguridad del evento recae en los organizadores respectivos.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
