# WhatsApp Inbox UI - Módulo Completo

Un módulo completo para gestionar conversaciones de WhatsApp Business usando React, TypeScript y Zustand.

## 🚀 Características

- ✅ **Interfaz de chat completa** tipo WhatsApp Web
- ✅ **Lista de conversaciones** con búsqueda y filtros
- ✅ **Burbujas de mensaje** con soporte multimedia
- ✅ **Notificaciones en tiempo real** con sonido y desktop notifications
- ✅ **Plantillas de mensajes** reutilizables
- ✅ **Respuestas rápidas** con atajos de teclado
- ✅ **Configuración de Twilio** con test de conexión
- ✅ **Estadísticas y métricas** de rendimiento
- ✅ **Dark mode** integrado
- ✅ **Responsive design** (mobile-first)
- ✅ **TypeScript** con tipos completos
- ✅ **Estado global** con Zustand

## 📦 Estructura del Módulo

```
/components/whatsapp-inbox/
├── WhatsAppInbox.tsx           # Componente principal
├── ConversationList.tsx        # Lista de conversaciones
├── ChatView.tsx               # Vista de chat individual
├── MessageBubble.tsx          # Burbujas de mensajes
├── MessageInput.tsx           # Input para escribir
├── WhatsAppConfig.tsx         # Configuración de Twilio
├── TemplateManager.tsx        # Gestión de plantillas
├── QuickReplies.tsx          # Respuestas rápidas
├── WhatsAppStats.tsx         # Estadísticas y métricas
├── types/whatsapp.types.ts   # Interfaces TypeScript
├── hooks/
│   ├── useWhatsAppAPI.ts     # Hook para API calls
│   ├── useWhatsAppStore.ts   # Estado global Zustand
│   └── useWhatsAppRealTime.ts # Notificaciones tiempo real
└── index.ts                  # Exports del módulo
```

## 🛠️ Instalación y Uso

### 1. Importar el componente principal

```tsx
import { WhatsAppInbox } from '@/components/whatsapp-inbox';

export default function WhatsAppPage() {
  const companyId = "your-company-id";
  
  return (
    <div className="h-screen">
      <WhatsAppInbox companyId={companyId} />
    </div>
  );
}
```

### 2. Usar componentes individuales

```tsx
import { 
  ConversationList, 
  ChatView, 
  WhatsAppConfig,
  useWhatsAppStore 
} from '@/components/whatsapp-inbox';

function CustomWhatsAppLayout() {
  const { conversations, selectedConversation } = useWhatsAppStore();
  
  return (
    <div className="flex h-screen">
      <div className="w-80">
        <ConversationList conversations={conversations} />
      </div>
      <div className="flex-1">
        <ChatView conversation={selectedConversation} />
      </div>
    </div>
  );
}
```

### 3. Configurar notificaciones en tiempo real

```tsx
import { useWhatsAppRealTime } from '@/components/whatsapp-inbox';

function WhatsAppWithNotifications() {
  const companyId = "your-company-id";
  
  // Habilitar notificaciones en tiempo real
  useWhatsAppRealTime({
    companyId,
    enabled: true,
    playNotificationSound: true,
    showDesktopNotifications: true,
  });

  return <WhatsAppInbox companyId={companyId} />;
}
```

## 🔧 Configuración del Backend

### APIs requeridas

El módulo consume estas APIs del backend:

```
GET /api/whatsapp/conversations/:companyId
GET /api/whatsapp/messages/:conversationId  
POST /api/whatsapp/send
PUT /api/whatsapp/messages/:messageId/read
GET /api/whatsapp/config/:companyId
PUT /api/whatsapp/config/:companyId
POST /api/whatsapp/config/:companyId/test
GET /api/whatsapp/templates/:companyId
POST /api/whatsapp/templates
PUT /api/whatsapp/templates/:templateId
DELETE /api/whatsapp/templates/:templateId
GET /api/whatsapp/quick-replies/:companyId
```

### Configuración de Twilio

1. Crear cuenta en [Twilio](https://twilio.com)
2. Configurar WhatsApp Business en Twilio Console
3. Obtener credenciales (Account SID, Auth Token, Phone Number)
4. Configurar webhook: `https://tudominio.com/api/whatsapp/webhook`

## 🎨 Personalización

### Temas y estilos

El módulo usa Tailwind CSS y soporta dark mode automáticamente:

```tsx
// Los componentes se adaptan automáticamente al tema
<WhatsAppInbox 
  companyId={companyId}
  className="custom-whatsapp-styles" 
/>
```

### Estado personalizado

Accede al store de Zustand para estado personalizado:

```tsx
import { useWhatsAppStore } from '@/components/whatsapp-inbox';

function CustomComponent() {
  const { 
    conversations, 
    unreadCount, 
    selectedConversation,
    addMessage,
    selectConversation 
  } = useWhatsAppStore();

  // Tu lógica personalizada
}
```

## 📱 Responsive Design

El módulo está optimizado para todas las pantallas:

- **Desktop**: Sidebar + chat de dos paneles
- **Tablet**: Sidebar colapsable
- **Mobile**: Vista de stack con navegación

## 🔔 Notificaciones

### Sonidos
- Se reproduce un sonido al recibir mensajes nuevos
- Audio configurable en `public/sounds/notification.mp3`

### Desktop Notifications
- Notificaciones nativas del navegador
- Pide permisos automáticamente
- Clickeable para enfocar la ventana

### Tiempo Real
- Polling cada 10 segundos por defecto
- Se adapta cuando la página no está visible
- Manejo automático de reconexión

## 🧪 Testing

### Componentes de prueba

```tsx
// Para testing, usa mocks del store
import { render } from '@testing-library/react';
import { WhatsAppInbox } from '@/components/whatsapp-inbox';

// Mock del store si es necesario
jest.mock('@/components/whatsapp-inbox/hooks/useWhatsAppStore');

test('renders WhatsApp inbox', () => {
  render(<WhatsAppInbox companyId="test-company" />);
});
```

## 🚨 Troubleshooting

### Problemas comunes

1. **No se cargan las conversaciones**
   - Verificar que el `companyId` sea válido
   - Comprobar conexión con el backend
   - Revisar configuración de Twilio

2. **Notificaciones no funcionan**
   - Verificar permisos del navegador
   - Comprobar que el archivo de audio existe
   - Verificar polling en tiempo real

3. **Errores de CORS**
   - Configurar CORS en el backend
   - Verificar URLs de API

### Logs de debug

El módulo incluye logging detallado:

```tsx
// Habilitar logs en desarrollo
localStorage.setItem('whatsapp-debug', 'true');
```

## 📈 Métricas y Analytics

El componente `WhatsAppStats` proporciona:

- Total de conversaciones
- Mensajes no leídos
- Tasa de respuesta
- Tiempo promedio de respuesta
- Actividad por horarios
- Comparativas temporales

## 🔒 Seguridad

- Todas las API calls usan autenticación
- Tokens de Twilio se manejan de forma segura
- No se almacenan credenciales en localStorage
- Validación de entrada en todos los formularios

## 🎯 Próximas Funcionalidades

- [ ] Asignación de conversaciones a agentes
- [ ] Etiquetas y categorías de conversaciones  
- [ ] Automatización de respuestas
- [ ] Integración con CRM
- [ ] Exportación de conversaciones
- [ ] Métricas avanzadas con gráficos

## 🤝 Contribuir

Para mejorar el módulo:

1. Seguir la arquitectura modular establecida
2. Mantener archivos bajo 300 líneas
3. Usar TypeScript estricto
4. Documentar interfaces y props
5. Incluir manejo de errores

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación, consultar la documentación del backend WhatsApp API correspondiente.