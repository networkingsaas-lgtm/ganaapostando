import { Database, Lock, ShieldCheck } from 'lucide-react';
import LegalPageTemplate from '../features/home/components/LegalPageTemplate';

const SUMMARY_CARDS = [
  {
    title: 'Datos recogidos',
    description: 'La plataforma puede tratar datos de registro, acceso, pagos y comunicaciones necesarias para prestar el servicio.',
    icon: Database,
  },
  {
    title: 'Finalidades y base legal',
    description: 'Los datos se usan para gestionar tu cuenta, darte acceso a contenidos, atender soporte y cumplir obligaciones legales.',
    icon: ShieldCheck,
  },
  {
    title: 'Seguridad y derechos',
    description: 'Se adoptan medidas razonables de seguridad y puedes ejercer tus derechos de acceso, rectificación, supresión y oposición.',
    icon: Lock,
  },
];

const PRIVACY_SECTIONS = [
  {
    eyebrow: '01',
    title: 'Responsable del tratamiento',
    paragraphs: [
      'Esta política explica cómo se tratan los datos personales de las personas que navegan por la web, se registran o contratan productos digitales dentro de la plataforma.',
      'Antes de publicar esta versión, debes completar los datos reales del titular del sitio, domicilio profesional y canal de contacto habilitado para solicitudes de privacidad.',
    ],
  },
  {
    eyebrow: '02',
    title: 'Datos que se pueden recopilar',
    paragraphs: [
      'Podemos tratar datos identificativos y de contacto como nombre de usuario, email, credenciales de acceso y otros datos facilitados al registrarte o comunicarte con el soporte.',
      'También pueden tratarse datos técnicos y operativos como logs de acceso, identificadores de sesión, información del dispositivo o datos vinculados al cobro y a la gestión de pagos.',
    ],
    bullets: [
      'Datos facilitados directamente por el usuario en formularios y procesos de compra.',
      'Datos generados durante el uso del sitio para seguridad, autenticación y prestación del servicio.',
    ],
  },
  {
    eyebrow: '03',
    title: 'Finalidades del tratamiento',
    paragraphs: [
      'Los datos personales se utilizan para crear y mantener tu cuenta, permitir el inicio de sesión, gestionar compras, habilitar accesos y prestar soporte técnico o comercial.',
      'También pueden emplearse para prevenir fraude, asegurar la plataforma, atender incidencias, cumplir obligaciones legales y mejorar el funcionamiento del servicio.',
    ],
  },
  {
    eyebrow: '04',
    title: 'Base jurídica',
    paragraphs: [
      'La base jurídica principal del tratamiento es la ejecución de la relación contractual o precontractual cuando solicitas una cuenta, compras un producto o utilizas funcionalidades reservadas.',
      'En determinados casos, el tratamiento puede apoyarse además en el consentimiento, el interés legítimo en proteger la plataforma o el cumplimiento de obligaciones legales.',
    ],
  },
  {
    eyebrow: '05',
    title: 'Destinatarios y proveedores',
    paragraphs: [
      'Los datos pueden ser tratados por proveedores que prestan servicios necesarios para la operativa del sitio, como autenticación, almacenamiento, infraestructura técnica o pasarelas de pago.',
      'En esta aplicación existen integraciones técnicas con servicios como Supabase y Stripe, que actúan conforme a sus propias condiciones y acuerdos de tratamiento aplicables.',
    ],
    bullets: [
      'No se venderán datos personales a terceros.',
      'Solo se compartirán datos cuando sea necesario para prestar el servicio, por obligación legal o con tu consentimiento.',
    ],
  },
  {
    eyebrow: '06',
    title: 'Conservación de la información',
    paragraphs: [
      'Los datos se conservarán durante el tiempo necesario para cumplir la finalidad para la que fueron recogidos, mantener la relación contractual y atender responsabilidades legales o administrativas.',
      'Cuando ya no sean necesarios, se suprimirán o bloquearán conforme a la normativa aplicable y a las políticas internas de retención que adopte el proyecto.',
    ],
  },
  {
    eyebrow: '07',
    title: 'Derechos del usuario',
    paragraphs: [
      'Puedes solicitar el acceso, rectificación, supresión, oposición, limitación del tratamiento o portabilidad de tus datos, así como retirar el consentimiento cuando el tratamiento se base en él.',
      'Para ello, la versión publicada debe incluir un canal real de contacto. Si consideras que tus derechos no han sido atendidos correctamente, podrás acudir a la autoridad de control competente.',
    ],
  },
  {
    eyebrow: '08',
    title: 'Seguridad, cookies y cambios',
    paragraphs: [
      'Se aplican medidas técnicas y organizativas razonables para reducir el riesgo de acceso no autorizado, pérdida o alteración de la información personal tratada en la plataforma.',
      'Si el sitio utiliza cookies técnicas, analíticas o de terceros, conviene complementar esta página con una política de cookies específica y un mecanismo de consentimiento cuando sea exigible.',
    ],
    bullets: [
      'Las actualizaciones relevantes de esta política se publicarán indicando una nueva fecha de revisión.',
      'El uso continuado del sitio tras la publicación de cambios implicará conocimiento de la nueva versión publicada.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageTemplate
      title="Política de privacidad"
      subtitle="Este documento resume qué datos personales puede tratar la plataforma, con qué finalidad se usan y qué derechos conserva cada usuario sobre su información."
      lastUpdated="9 de abril de 2026"
      summaryCards={SUMMARY_CARDS}
      sections={PRIVACY_SECTIONS}
      complementaryLink={{
        href: '/terminos-del-servicio',
        label: 'Ver términos del servicio',
      }}
    />
  );
}
