import { FileText, ReceiptText, Scale } from 'lucide-react';
import LegalPageTemplate from '../features/home/components/LegalPageTemplate';

const SUMMARY_CARDS = [
  {
    title: 'Uso de la plataforma',
    description: 'El acceso a cursos, materiales y funcionalidades implica la aceptación de estas condiciones de uso.',
    icon: FileText,
  },
  {
    title: 'Pagos y reembolsos',
    description: 'Las compras, renovaciones y cualquier política comercial aplicable deben respetar las condiciones informadas en la plataforma.',
    icon: ReceiptText,
  },
  {
    title: 'Responsabilidad y límites',
    description: 'El contenido es formativo y no constituye asesoramiento financiero, jurídico ni promesa de resultados.',
    icon: Scale,
  },
];

const LEGAL_SECTIONS = [
  {
    eyebrow: '01',
    title: 'Objeto y aceptación',
    paragraphs: [
      'Estos términos regulan el acceso y uso de la web, sus áreas privadas, cursos, materiales descargables y cualquier otro servicio digital asociado a la plataforma.',
      'Al navegar por el sitio, registrarte o contratar un producto, aceptas quedar vinculado por estas condiciones. Si no estás de acuerdo con alguna parte, debes abstenerte de utilizar el servicio.',
    ],
  },
  {
    eyebrow: '02',
    title: 'Registro y cuenta de usuario',
    paragraphs: [
      'Para acceder a determinadas funcionalidades puede ser necesario crear una cuenta con datos veraces, completos y actualizados.',
      'Eres responsable de custodiar tus credenciales y de cualquier actividad realizada desde tu cuenta, salvo que acredites un uso no autorizado ajeno a tu control razonable.',
    ],
    bullets: [
      'No puedes compartir tu acceso con terceros sin autorización expresa.',
      'La plataforma puede suspender o limitar cuentas con indicios de uso fraudulento, cesión no permitida o incumplimiento grave.',
    ],
  },
  {
    eyebrow: '03',
    title: 'Uso permitido del contenido',
    paragraphs: [
      'Los cursos, vídeos, hojas de trabajo, imágenes, textos y demás recursos se facilitan para uso personal y no exclusivo del usuario que contrata el servicio.',
      'Queda prohibida la reproducción, distribución, venta, grabación, cesión, publicación o explotación comercial del contenido sin autorización previa por escrito.',
    ],
    bullets: [
      'No está permitido revender accesos, copiar lecciones o redistribuir materiales del área privada.',
      'Tampoco se permite utilizar la plataforma para actividades ilícitas o que perjudiquen la seguridad del sitio.',
    ],
  },
  {
    eyebrow: '04',
    title: 'Condiciones económicas',
    paragraphs: [
      'Los precios mostrados en la web son los vigentes en el momento de la compra y pueden ser modificados para futuras contrataciones sin afectar compras ya confirmadas.',
      'Los pagos se procesan mediante proveedores externos. El usuario debe revisar también las condiciones del proveedor de pago utilizado durante el checkout.',
    ],
    bullets: [
      'Si existe una garantía comercial o un plazo de reembolso, solo será aplicable en los términos expresamente anunciados en la oferta.',
      'Los impuestos, comisiones bancarias o cargos de terceros aplicables a la operación serán asumidos conforme a la normativa y al método de pago elegido.',
    ],
  },
  {
    eyebrow: '05',
    title: 'Propiedad intelectual',
    paragraphs: [
      'Todos los derechos sobre la marca, diseño, código, metodología, textos, vídeos, bases de datos y demás elementos de la plataforma pertenecen a su titular o a terceros licenciantes.',
      'El acceso al servicio no supone cesión de derechos de propiedad intelectual o industrial, más allá de la licencia limitada necesaria para el uso normal de la plataforma.',
    ],
  },
  {
    eyebrow: '06',
    title: 'Descargo sobre resultados y decisiones',
    paragraphs: [
      'La información publicada tiene carácter educativo e informativo. No constituye asesoramiento de inversión, recomendación personalizada ni garantía de beneficio económico.',
      'Cada usuario es responsable de sus decisiones, de la gestión de su capital y del cumplimiento de la normativa aplicable en su jurisdicción.',
    ],
    bullets: [
      'Los resultados pasados o ejemplos mostrados no garantizan resultados futuros.',
      'La plataforma no responde por pérdidas derivadas de decisiones tomadas a partir del contenido formativo.',
    ],
  },
  {
    eyebrow: '07',
    title: 'Suspensión, cambios y contacto',
    paragraphs: [
      'La plataforma puede actualizar sus funcionalidades, modificar estos términos o interrumpir temporalmente el servicio por mantenimiento, razones técnicas o causas de seguridad.',
      'Cuando los cambios sean relevantes, se publicará una nueva versión con su fecha de actualización. El uso continuado del servicio tras su entrada en vigor implicará aceptación de los cambios.',
    ],
    bullets: [
      'Antes de publicar esta página, sustituye el email de contacto y los datos del titular por los datos reales del proyecto.',
      'Si necesitas una versión jurídicamente cerrada, conviene revisarla con un profesional legal antes de ponerla en producción.',
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPageTemplate
      title="Términos del servicio"
      subtitle="Aquí se recogen las reglas básicas de acceso, uso, compra y limitación de responsabilidad aplicables a la plataforma y a sus contenidos digitales."
      lastUpdated="9 de abril de 2026"
      summaryCards={SUMMARY_CARDS}
      sections={LEGAL_SECTIONS}
      complementaryLink={{
        href: '/politica-de-privacidad',
        label: 'Ver política de privacidad',
      }}
    />
  );
}
