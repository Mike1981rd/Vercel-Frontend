# Contact Notifications System

Sistema completo de notificaciones para formularios de contacto que se integra de forma no invasiva con formularios existentes.

## 🎯 Características Principales

### 1. Toast Notifications
- ✅ Notificaciones visuales de éxito/error
- ✅ Loading states automáticos
- ✅ Mensajes personalizables
- ✅ Posicionamiento configurable
- ✅ Temas responsive (light/dark)

### 2. Email Notifications
- ✅ Emails automáticos al admin cuando llegan mensajes
- ✅ Templates HTML personalizables
- ✅ Configuración de destinatarios
- ✅ Plantillas con variables dinámicas

### 3. Dashboard Notifications
- ✅ Badge contador en tiempo real
- ✅ Panel dropdown con lista de mensajes
- ✅ Estados de lectura/archivado
- ✅ Auto-refresh configurable
- ✅ Filtros por estado

### 4. Sound Notifications (opcional)
- ✅ Sonido personalizable para nuevos mensajes
- ✅ Web Audio API sin dependencias externas

### 5. Sistema de Configuración
- ✅ Panel de configuración completo
- ✅ Activación/desactivación por tipo
- ✅ Mensajes personalizables
- ✅ Persistencia en base de datos

## 🚀 Instalación y Configuración

### Paso 1: Migración de Base de Datos

```bash
# El sistema ya incluye las migraciones automáticas
# Los modelos ContactMessage y ContactNotificationSettings se crearán automáticamente
```

### Paso 2: Agregar Provider a la Aplicación

```tsx
// En tu layout principal o _app.tsx
import ContactNotificationProvider from '@/components/notifications/ContactNotificationProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ContactNotificationProvider>
          {children}
        </ContactNotificationProvider>
      </body>
    </html>
  );
}
```

### Paso 3: Integración Automática (Método Fácil)

```tsx
// Envolver cualquier página con formularios de contacto
import ContactFormEnhancer from '@/components/notifications/ContactFormEnhancer';

export default function ContactPage() {
  return (
    <ContactFormEnhancer autoEnhance={true}>
      <div>
        {/* Tu formulario de contacto existente aquí */}
        <form>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <textarea placeholder="Message"></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </ContactFormEnhancer>
  );
}
```

### Paso 4: Agregar Notificaciones al Dashboard

```tsx
// En tu header/navbar del dashboard
import ContactNotificationPanel from '@/components/notifications/ContactNotificationPanel';
import ContactNotificationBadge from '@/components/notifications/ContactNotificationBadge';

export default function DashboardHeader() {
  return (
    <header>
      <div className="flex items-center gap-4">
        {/* Opción 1: Panel completo con dropdown */}
        <ContactNotificationPanel companyId={companyId} />
        
        {/* Opción 2: Solo badge contador */}
        <div className="relative">
          <BellIcon />
          <ContactNotificationBadge companyId={companyId} />
        </div>
      </div>
    </header>
  );
}
```

## 🎛️ Configuración Avanzada

### Hook de Notificaciones Personalizado

```tsx
import { useContactNotifications } from '@/hooks/useContactNotifications';

function MyComponent() {
  const {
    isSubmitting,
    unreadCount,
    notifications,
    settings,
    submitContactForm,
    showSuccessToast,
    showErrorToast,
    updateSettings
  } = useContactNotifications();

  const handleSubmit = async (formData) => {
    const success = await submitContactForm(companyId, formData);
    if (success) {
      // Form submitted successfully
    }
  };

  return (
    <div>
      {/* Tu UI aquí */}
    </div>
  );
}
```

### Configuración Manual de Formularios

```tsx
import { useEnhancedContactForm } from '@/hooks/useEnhancedContactForm';

function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { enhanceContactForm } = useEnhancedContactForm();

  useEffect(() => {
    if (formRef.current) {
      enhanceContactForm(formRef.current);
    }
  }, []);

  return <form ref={formRef}>{/* campos */}</form>;
}
```

### Panel de Configuración

```tsx
import ContactNotificationSettings from '@/components/notifications/ContactNotificationSettings';

export default function SettingsPage() {
  return (
    <div>
      <ContactNotificationSettings 
        companyId={companyId}
        onSave={() => console.log('Settings saved!')}
      />
    </div>
  );
}
```

## 📡 API Endpoints

### Mensajes de Contacto

```typescript
// GET /api/contact/company/{companyId}/messages
// Obtener mensajes con filtros
const messages = await fetch(`/api/contact/company/${companyId}/messages?status=unread&page=1&pageSize=10`);

// POST /api/contact/company/{companyId}/submit
// Enviar nuevo mensaje
const response = await fetch(`/api/contact/company/${companyId}/submit`, {
  method: 'POST',
  body: JSON.stringify({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+1234567890',
    message: 'Mensaje de prueba'
  })
});

// PUT /api/contact/company/{companyId}/messages/{messageId}/status
// Actualizar estado del mensaje
await fetch(`/api/contact/company/${companyId}/messages/${messageId}/status`, {
  method: 'PUT',
  body: JSON.stringify({ status: 'read' })
});

// GET /api/contact/company/{companyId}/unread-count
// Obtener contador de no leídos
const { data: count } = await fetch(`/api/contact/company/${companyId}/unread-count`);
```

### Configuraciones

```typescript
// GET /api/contact/company/{companyId}/notification-settings
// Obtener configuraciones
const settings = await fetch(`/api/contact/company/${companyId}/notification-settings`);

// PUT /api/contact/company/{companyId}/notification-settings
// Actualizar configuraciones
await fetch(`/api/contact/company/${companyId}/notification-settings`, {
  method: 'PUT',
  body: JSON.stringify({
    emailNotificationsEnabled: true,
    toastNotificationsEnabled: true,
    dashboardNotificationsEnabled: true,
    playSoundOnNewMessage: false,
    notificationEmailAddress: 'admin@example.com',
    emailSubjectTemplate: 'New Contact Message from {name}',
    toastSuccessMessage: '¡Mensaje enviado correctamente!',
    toastErrorMessage: 'Error al enviar mensaje'
  })
});
```

## 🎨 Personalización

### Estilos de Toast

```typescript
// El provider acepta configuración de estilos
<ContactNotificationProvider
  toastOptions={{
    success: {
      style: {
        background: '#10B981',
        color: '#fff',
      }
    },
    error: {
      style: {
        background: '#EF4444',
        color: '#fff',
      }
    }
  }}
>
```

### Badge Personalizado

```typescript
<ContactNotificationBadge
  companyId={companyId}
  className="custom-badge-styles"
  showZero={true}
  autoRefresh={true}
  refreshInterval={15000} // 15 seconds
/>
```

## 🔧 Troubleshooting

### Problema: Los formularios no se detectan automáticamente

**Solución**: Usar integración manual:

```tsx
const { enhanceContactForm } = useEnhancedContactForm();

useEffect(() => {
  const form = document.getElementById('contact-form') as HTMLFormElement;
  if (form) {
    enhanceContactForm(form);
  }
}, []);
```

### Problema: Las notificaciones no aparecen

**Verificar**:
1. El `ContactNotificationProvider` está envolviendo la aplicación
2. El `companyId` existe en localStorage
3. Las configuraciones permiten el tipo de notificación

### Problema: Los emails no se envían

**Verificar**:
1. El `EmailService` está configurado correctamente
2. La dirección de destino está configurada
3. Los permisos del servidor de email

## 📊 Base de Datos

### Tablas Creadas

```sql
-- Mensajes de contacto
CREATE TABLE ContactMessages (
    Id SERIAL PRIMARY KEY,
    CompanyId INTEGER NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    Message TEXT NOT NULL,
    Status VARCHAR(50) DEFAULT 'unread',
    IsNotificationSent BOOLEAN DEFAULT FALSE,
    IpAddress VARCHAR(45),
    UserAgent VARCHAR(500),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReadAt TIMESTAMP,
    ArchivedAt TIMESTAMP
);

-- Configuraciones de notificaciones
CREATE TABLE ContactNotificationSettings (
    Id SERIAL PRIMARY KEY,
    CompanyId INTEGER NOT NULL UNIQUE,
    EmailNotificationsEnabled BOOLEAN DEFAULT TRUE,
    ToastNotificationsEnabled BOOLEAN DEFAULT TRUE,
    DashboardNotificationsEnabled BOOLEAN DEFAULT TRUE,
    PlaySoundOnNewMessage BOOLEAN DEFAULT FALSE,
    NotificationEmailAddress VARCHAR(255) NOT NULL,
    EmailSubjectTemplate VARCHAR(200) DEFAULT 'New Contact Message from {name}',
    ToastSuccessMessage VARCHAR(100) DEFAULT 'Message sent successfully!',
    ToastErrorMessage VARCHAR(100) DEFAULT 'Error sending message. Please try again.',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🌟 Características Avanzadas

### Auto-detección de Formularios
- Detecta automáticamente formularios basándose en campos
- Funciona con formularios dinámicos (React, Vue, vanilla JS)
- No modifica el HTML existente

### Prevención de Envíos Duplicados
- Sistema de locks para evitar múltiples envíos
- Estados de loading apropiados
- Limpieza automática de formularios tras envío exitoso

### Configuración Granular
- Activar/desactivar cada tipo de notificación
- Mensajes completamente personalizables
- Plantillas de email con variables

### Integración Transparente
- Zero breaking changes en código existente
- Funciona con cualquier framework frontend
- Compatible con SSR/SSG

## 🔐 Seguridad

- Validación de datos en backend
- Sanitización de HTML en emails
- Rate limiting implementable
- Logs de actividad con IP y User Agent
- Protección CSRF via tokens

## 📈 Performance

- Lazy loading de componentes
- Debouncing en auto-refresh
- Paginación en listados
- Compresión de payloads
- Caché inteligente de configuraciones

---

**¡El sistema está listo para usar!** Solo necesitas envolver tus páginas con el enhancer y el sistema detectará y mejorará automáticamente todos los formularios de contacto.