"use client";

import React from "react";
import LegalLayout from "@/components/LegalLayout";

export default function TicketReservationTermsPage() {
  return (
    <LegalLayout
      title="Condiciones de Reserva"
      subtitle="Reglas, políticas de reserva, validez de pases QR y admisión para la reserva de entradas y pases en 4GO."
      activeTab="reservation"
    >
      <div className="prose prose-zinc max-w-none space-y-6 text-sm sm:text-base">
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
          Última actualización: <span className="font-semibold text-zinc-900">26 de Agosto de 2026</span>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">1. Emisión y Entrega de Pases de Reserva</h2>
          <p>
            Al completar exitosamente una reserva o registro en 4GO, se generará un pase digital (Party Pass) con un código QR único e irrepetible. Dicho pase se envía al correo registrado y se almacena en el perfil del usuario para su acceso en puerta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">2. Validez y Control de Acceso</h2>
          <p>
            Cada pase QR de reserva permite un único escaneo en el control de acceso del recinto o establecimiento. Una vez validado en puerta por el personal autorizado o escáner NFC, la reserva quedará registrada como asistida y no podrá volver a emplearse.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">3. Políticas de Reserva y Aforo</h2>
          <p>
            4GO opera como una plataforma de gestión de eventos y reservas de pases de acceso. Las reservas están sujetas al aforo del evento y a las políticas dispuestas por los organizadores:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-700">
            <li>Las reservas otorgan acceso prioritario de acuerdo con el tipo de pase seleccionado (General / VIP).</li>
            <li>En caso de reprogramación o modificación de lugar por parte del organizador, la reserva se mantendrá vigente para la nueva fecha.</li>
            <li>El usuario puede cancelar o solicitar reasignación de su reserva enviando una solicitud a soporte.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">4. Derecho de Admisión y Permanencia</h2>
          <p>
            El organizador del evento y el establecimiento reservan el derecho de admisión y permanencia conforme a las leyes vigentes y normas internas de seguridad (edad mínima requerida, vestimenta, control de objetos no permitidos).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">5. Recuperación de Pases de Reserva</h2>
          <p>
            Si pierdes el acceso a tu correo o pase de reserva, puedes utilizar el módulo "Recuperar Mis Entradas" disponible en la plataforma para verificar tu identidad y recibir nuevamente tus pases.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
