import { Vehicle } from '../types/workshop';

export type WhatsAppTemplateId =
  | 'diagnostico'
  | 'reparacion'
  | 'falta_pieza'
  | 'presupuesto'
  | 'listo';

export interface WhatsAppTemplateConfig {
  id: WhatsAppTemplateId;
  label: string;
  shortLabel: string;
  description: string;
  badgeColor: string;
  iconName: string;
  summaryText: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplateConfig[] = [
  {
    id: 'diagnostico',
    label: 'Aún en diagnosis técnica',
    shortLabel: 'En diagnosis',
    description: 'Avisar que seguimos revisando el vehículo para localizar la avería',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    iconName: 'Search',
    summaryText: 'Aún estamos realizando las pruebas de diagnosis'
  },
  {
    id: 'reparacion',
    label: 'Aún en reparación en taller',
    shortLabel: 'En reparación',
    description: 'Avisar que el vehículo continúa en proceso de reparación en el box',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    iconName: 'Wrench',
    summaryText: 'El vehículo aún se está reparando según lo previsto'
  },
  {
    id: 'falta_pieza',
    label: 'Falta de piezas en recambios',
    shortLabel: 'Falta de recambios',
    description: 'Avisar que estamos a la espera de recibir las piezas o repuestos',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    iconName: 'PackageX',
    summaryText: 'A falta de que vengan piezas necesarias a recambios'
  },
  {
    id: 'presupuesto',
    label: 'Esperando respuesta del presupuesto',
    shortLabel: 'A la espera de presupuesto',
    description: 'Avisar que el presupuesto está listo y esperamos su confirmación',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    iconName: 'FileText',
    summaryText: 'A la espera de respuesta o aprobación de presupuesto'
  },
  {
    id: 'listo',
    label: 'Vehículo terminado (Puede venir a por él)',
    shortLabel: 'Listo para recogida',
    description: 'Avisar que el coche está listo, probado y puede pasar a retirarlo',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconName: 'CheckCircle2',
    summaryText: 'El vehículo ya está terminado y puede venir a por él'
  }
];

interface MessageOptions {
  customNote?: string;
  workshopName?: string;
  includeOrNumber?: boolean;
}

/**
 * Builds custom WhatsApp message text matching the 5 exact situations requested by the user
 * with Concesionario de Autoforma branding and "Un cordial saludo desde Autoforma" sign-off.
 */
export function generateWhatsAppMessage(
  templateId: WhatsAppTemplateId,
  vehicle: Vehicle,
  options: MessageOptions = {}
): string {
  const workshopName = options.workshopName || 'Concesionario de Autoforma';
  const clientGreeting = vehicle.clientName ? `Hola ${vehicle.clientName}` : 'Estimado/a cliente';
  const vehicleDesc = `${vehicle.model} (matrícula *${vehicle.plate}*)`;
  const orNotice = options.includeOrNumber && vehicle.orNumber ? ` [Ref: ${vehicle.orNumber}]` : '';

  let body = '';

  switch (templateId) {
    case 'diagnostico':
      body = 
`Te contactamos desde *${workshopName}* para informarte sobre el estado de tu vehículo ${vehicleDesc}${orNotice}.

🔍 *Estado actual: En diagnosis técnica*
Actualmente nuestros técnicos especialistas continúan realizando las pruebas y comprobaciones de diagnosis para determinar con total precisión el origen de la avería.

Tan pronto tengamos el diagnóstico completo y las conclusiones técnicas, nos pondremos en contacto contigo para indicarte los siguientes pasos.`;
      break;

    case 'reparacion':
      body = 
`Te escribimos desde *${workshopName}* para darte una actualización sobre tu vehículo ${vehicleDesc}${orNotice}.

🔧 *Estado actual: En reparación*
Te informamos de que tu vehículo aún se encuentra en nuestro taller en pleno proceso de reparación mecánica. Nuestros mecánicos están trabajando en él para dejarlo en perfecto estado según lo planificado.

Seguimos avanzando en los trabajos y te avisaremos en cuanto esté finalizado.`;
      break;

    case 'falta_pieza': {
      const partDetail = vehicle.missingPartName 
        ? `\n📦 *Pieza pendiente:* ${vehicle.missingPartName}${vehicle.missingPartReference ? ` (Ref: ${vehicle.missingPartReference})` : ''}`
        : '';

      body = 
`Te contactamos desde *${workshopName}* con relación a tu vehículo ${vehicleDesc}${orNotice}.

⏳ *Estado actual: A la espera de recambios*
Queremos comunicarte que actualmente nos encontramos a falta de que nos lleguen las piezas y repuestos originales necesarios a nuestro departamento de recambios.${partDetail}

En cuanto el material llegue a nuestras instalaciones continuaremos de inmediato con el montaje. Lamentamos esta pequeña espera y te mantendremos informado de la llegada.`;
      break;
    }

    case 'presupuesto':
      body = 
`Nos ponemos en contacto contigo desde *${workshopName}* sobre tu vehículo ${vehicleDesc}${orNotice}.

📋 *Estado actual: A la espera de respuesta del presupuesto*
Te informamos de que ya tenemos listo y valorado el presupuesto para la intervención de tu vehículo. Estamos a la espera de tu respuesta o aprobación para poder poner en marcha los trabajos mecánicos en taller.

Si tienes cualquier consulta o necesitas que revisemos algún detalle juntos, estamos a tu entera disposición.`;
      break;

    case 'listo':
    default:
      body = 
`¡Excelentes noticias desde *${workshopName}*! 🚗✨

🏁 *Estado: Vehículo terminado*
Nos complace comunicarte que tu vehículo ${vehicleDesc}${orNotice} ya está completamente terminado, verificado y listo para su entrega.

Ya puedes venir a por él a nuestras instalaciones en nuestro horario habitual de taller. ¡Muchas gracias por tu confianza!`;
      break;
  }

  // Optional custom notes
  if (options.customNote && options.customNote.trim()) {
    body += `\n\n📌 *Nota adicional:* ${options.customNote.trim()}`;
  }

  body = `${clientGreeting},\n\n${body}\n\nUn cordial saludo desde Autoforma`;

  return body;
}

/**
 * Builds clean WhatsApp URL for web or mobile
 */
export function buildWhatsAppUrl(
  phoneCountryCode: string,
  phoneNumber: string,
  messageText: string
): string {
  // Clean phone number: remove all non-digit characters
  const cleanCode = phoneCountryCode.replace(/[^0-9]/g, '');
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const fullNumber = `${cleanCode}${cleanPhone}`;

  const encodedText = encodeURIComponent(messageText);

  // api.whatsapp.com works seamlessly across desktop (redirects to web.whatsapp.com or opens native app) and mobile
  return `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encodedText}`;
}

/**
 * Maps a Kanban column to the corresponding default WhatsApp template
 */
export function getTemplateForStatus(status: Vehicle['status']): WhatsAppTemplateId {
  switch (status) {
    case 'diagnostico':
      return 'diagnostico';
    case 'reparacion':
      return 'reparacion';
    case 'falta_pieza':
      return 'falta_pieza';
    case 'presupuesto':
      return 'presupuesto';
    case 'listo':
      return 'listo';
    case 'abrir_or':
    default:
      return 'diagnostico';
  }
}
