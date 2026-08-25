"use client";

import React from "react";
import LegalLayout from "@/components/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Política de Privacidad"
      subtitle="Información detallada sobre cómo recabamos, utilizamos, almacenamos y protegemos tus datos personales en 4GO."
      activeTab="privacy"
    >
      <div className="prose prose-zinc max-w-none space-y-6 text-sm sm:text-base">
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
          Última actualización: <span className="font-semibold text-zinc-900">25 de Agosto de 2026</span>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">1. Introducción</h2>
          <p>
            En 4GO (operado como plataforma de boletaje y ticketing digital de eventos y clubes), la privacidad y protección de los datos de nuestros usuarios es una prioridad fundamental. Esta Política de Privacidad describe nuestras prácticas con respecto a la recopilación, uso y divulgación de la información que obtenemos a través del sitio web, aplicaciones y servicios asociados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">2. Información que Recopilamos</h2>
          <p>Recopilamos varios tipos de información para proporcionar y mejorar nuestros servicios:</p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-700">
            <li>
              <strong>Datos de Identificación y Cuenta:</strong> Nombre completo, correo electrónico, número telefónico y credenciales provistas al iniciar sesión con Google u otros proveedores OAuth.
            </li>
            <li>
              <strong>Datos de Compra y Boletos:</strong> Historial de entradas adquiridas, códigos seriales de pases, métodos de pago procesados de manera encriptada y registros de validación QR.
            </li>
            <li>
              <strong>Datos Técnicos y de Dispositivo:</strong> Dirección IP encriptada/hasheada, agente de usuario del navegador, identificadores únicos y cookies necesarias para mantener la sesión.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">3. Uso de la Información</h2>
          <p>Utilizamos la información recopilada para las siguientes finalidades esenciales:</p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-700">
            <li>Emitir, validar y transferir entradas y Party Passes digitales con código QR seguro.</li>
            <li>Almacenar y sincronizar cuentas de usuario en nuestra base de datos PostgreSQL de forma segura.</li>
            <li>Procesar transacciones mediante pasarelas autorizadas y entregar comprobantes de pago.</li>
            <li>Brindar soporte técnico mediante nuestro asistente IA y canales de atención al cliente.</li>
            <li>Garantizar la seguridad de la plataforma y prevenir actividades fraudulentas o accesos no autorizados.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">4. Almacenamiento y Protección de Datos</h2>
          <p>
            Toda la información personal sensible se almacena de forma encriptada mediante algoritmos pgcrypto y hashing seguro en nuestras bases de datos PostgreSQL. Mantenemos salvaguardas físicas, electrónicas y de procedimiento para prevenir cualquier acceso no autorizado, alteración o pérdida de información.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">5. Derechos del Usuario (ARCO)</h2>
          <p>
            Como titular de los datos, tienes derecho a acceder, rectificar, cancelar o oponerte al tratamiento de tu información personal. Para ejercer cualquiera de estos derechos o solicitar la eliminación de tu cuenta, puedes comunicarte a <a href="mailto:soporte.nenez@gmail.com" className="text-black font-semibold underline">soporte.nenez@gmail.com</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2">6. Cambios a esta Política</h2>
          <p>
            Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Cualquier modificación será publicada en esta misma página con su fecha de revisión actualizada.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
