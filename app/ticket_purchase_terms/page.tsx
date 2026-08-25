"use client";

import React from "react";
import LegalLayout from "@/components/LegalLayout";

export default function TicketPurchaseTermsPage() {
  return (
    <LegalLayout
      title="Condiciones de Compra"
      subtitle="Reglas, políticas de reembolsos, validez de pases QR y admisión para la adquisición de entradas en 4GO."
      activeTab="purchase"
    >
      <div className="prose prose-zinc max-w-none space-y-6 text-sm sm:text-base">
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
          Última actualización: <span className="font-semibold text-zinc-900">25 de Agosto de 2026</span>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">1. Emisión y Entrega de Entradas</h2>
          <p>
            Al completar exitosamente una transacción o registro en 4GO, se generará una entrada o Party Pass digital con un código QR único e irrepetible. Dicho pase se envía al correo registrado y se almacena en el perfil del usuario.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">2. Validez y Control de Acceso</h2>
          <p>
            Cada pase QR permite un único escaneo en el control de acceso del recinto o establecimiento. Una vez validado en puerta por el personal autorizado o escáner NFC, el pase quedará marcado como utilizado y no podrá volver a emplearse.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">3. Políticas de Devolución y Cancelación</h2>
          <p>
            Las compras de entradas son definitivas. No se realizarán cambios ni reembolsos de dinero salvo en los siguientes casos expresamente estipulados:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-700">
            <li>Cancelación definitiva del evento por parte del organizador.</li>
            <li>Modificación sustancial de fecha o lugar del espectáculo sin que el cliente acepte el cambio.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">4. Derecho de Admisión y Permanencia</h2>
          <p>
            El organizador del evento y el establecimiento reservan el derecho de admisión y permanencia conforme a las leyes vigentes y normas internas de seguridad (edad mínima requerida, vestimenta, control de objetos no permitidos).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">5. Recuperación de Entradas Perdedoras</h2>
          <p>
            Si pierdes el acceso a tu correo o pase, puedes utilizar el módulo "Recuperar Mis Entradas" disponible en la plataforma para verificar tu identidad y recibir nuevamente tus pases.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
