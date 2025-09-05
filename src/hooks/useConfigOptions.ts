import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';

interface ConfigOption {
  id: number;
  type: string;
  value: string;
  labelEs: string;
  labelEn: string;
  icon?: string;
  iconType?: string;
  category?: string;
  sortOrder: number;
  usageCount: number;
  isActive: boolean;
  isCustom: boolean;
  isDefault: boolean;
}

export function useConfigOptions(type: string) {
  const { language } = useI18n();
  const [options, setOptions] = useState<ConfigOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Opciones hardcodeadas como fallback
  const getFallbackOptions = () => {
    switch (type) {
      case 'amenity':
        return [
          { value: 'wifi', label: 'WiFi', icon: '📶' },
          { value: 'tv', label: 'TV', icon: '📺' },
          { value: 'ac', label: language === 'es' ? 'Aire Acondicionado' : 'Air Conditioning', icon: '❄️' },
          { value: 'heating', label: language === 'es' ? 'Calefacción' : 'Heating', icon: '🔥' },
          { value: 'minibar', label: 'Minibar', icon: '🍹' },
          { value: 'safe', label: language === 'es' ? 'Caja Fuerte' : 'Safe', icon: '🔒' },
          { value: 'balcony', label: language === 'es' ? 'Balcón' : 'Balcony', icon: '🏠' },
          { value: 'terrace', label: language === 'es' ? 'Terraza' : 'Terrace', icon: '☀️' },
          { value: 'jacuzzi', label: 'Jacuzzi', icon: '💆' },
          { value: 'pool', label: language === 'es' ? 'Piscina' : 'Pool', icon: '🏊' },
          { value: 'gym', label: language === 'es' ? 'Gimnasio' : 'Gym', icon: '🏋️' },
          { value: 'parking', label: language === 'es' ? 'Estacionamiento' : 'Parking', icon: '🚗' }
        ];
      case 'room_type':
        return [
          { value: 'standard', label: language === 'es' ? 'Estándar' : 'Standard' },
          { value: 'deluxe', label: 'Deluxe' },
          { value: 'suite', label: 'Suite' },
          { value: 'junior_suite', label: 'Junior Suite' },
          { value: 'presidential', label: language === 'es' ? 'Presidencial' : 'Presidential' },
          { value: 'penthouse', label: 'Penthouse' }
        ];
      case 'view_type':
        return [
          { value: 'sea', label: language === 'es' ? 'Vista al Mar' : 'Sea View', icon: '🌊' },
          { value: 'city', label: language === 'es' ? 'Vista a la Ciudad' : 'City View', icon: '🏙️' },
          { value: 'garden', label: language === 'es' ? 'Vista al Jardín' : 'Garden View', icon: '🌳' },
          { value: 'pool', label: language === 'es' ? 'Vista a la Piscina' : 'Pool View', icon: '🏊' },
          { value: 'mountain', label: language === 'es' ? 'Vista a la Montaña' : 'Mountain View', icon: '⛰️' },
          { value: 'interior', label: language === 'es' ? 'Vista Interior' : 'Interior View', icon: '🏠' }
        ];
      case 'common_spaces':
        return [
          { value: 'kitchen', label: language === 'es' ? 'Cocina' : 'Kitchen', icon: '🍳' },
          { value: 'livingRoom', label: language === 'es' ? 'Sala de Estar' : 'Living Room', icon: '🛋️' },
          { value: 'diningRoom', label: language === 'es' ? 'Comedor' : 'Dining Room', icon: '🍽️' },
          { value: 'balcony', label: language === 'es' ? 'Balcón' : 'Balcony', icon: '🏠' },
          { value: 'terrace', label: language === 'es' ? 'Terraza' : 'Terrace', icon: '☀️' },
          { value: 'garden', label: language === 'es' ? 'Jardín' : 'Garden', icon: '🌳' },
          { value: 'pool', label: language === 'es' ? 'Piscina' : 'Pool', icon: '🏊' },
          { value: 'gym', label: language === 'es' ? 'Gimnasio' : 'Gym', icon: '🏋️' },
          { value: 'spa', label: language === 'es' ? 'Spa' : 'Spa', icon: '💆' },
          { value: 'parking', label: language === 'es' ? 'Estacionamiento' : 'Parking', icon: '🚗' }
        ];
      case 'house_rules':
        return [
          { value: 'smokingAllowed', label: language === 'es' ? 'Se permite fumar' : 'Smoking allowed', icon: '🚬' },
          { value: 'petsAllowed', label: language === 'es' ? 'Se permiten mascotas' : 'Pets allowed', icon: '🐕' },
          { value: 'eventsAllowed', label: language === 'es' ? 'Se permiten eventos' : 'Events allowed', icon: '🎉' },
          { value: 'partiesAllowed', label: language === 'es' ? 'Se permiten fiestas' : 'Parties allowed', icon: '🎊' },
          { value: 'childrenAllowed', label: language === 'es' ? 'Se permiten niños' : 'Children allowed', icon: '👶' },
          { value: 'visitorsAllowed', label: language === 'es' ? 'Se permiten visitantes' : 'Visitors allowed', icon: '👥' },
          { value: 'loudMusicAllowed', label: language === 'es' ? 'Se permite música alta' : 'Loud music allowed', icon: '🎵' },
          { value: 'commercialPhotoAllowed', label: language === 'es' ? 'Se permiten fotos comerciales' : 'Commercial photos allowed', icon: '📸' }
        ];
      case 'safety_property':
        return [
          { value: 'smokeDetector', label: language === 'es' ? 'Detector de humo' : 'Smoke detector', icon: '🚨' },
          { value: 'carbonMonoxideDetector', label: language === 'es' ? 'Detector de monóxido de carbono' : 'Carbon monoxide detector', icon: '⚠️' },
          { value: 'fireExtinguisher', label: language === 'es' ? 'Extintor' : 'Fire extinguisher', icon: '🧯' },
          { value: 'firstAidKit', label: language === 'es' ? 'Botiquín de primeros auxilios' : 'First aid kit', icon: '🏥' },
          { value: 'securityCameras', label: language === 'es' ? 'Cámaras de seguridad' : 'Security cameras', icon: '📹' },
          { value: 'alarmSystem', label: language === 'es' ? 'Sistema de alarma' : 'Alarm system', icon: '🔔' },
          { value: 'safe', label: language === 'es' ? 'Caja fuerte' : 'Safe', icon: '🔒' },
          { value: 'lockOnBedroom', label: language === 'es' ? 'Cerradura en habitación' : 'Lock on bedroom', icon: '🔐' },
          { value: 'emergencyExit', label: language === 'es' ? 'Salida de emergencia' : 'Emergency exit', icon: '🚪' },
          { value: 'emergencyPhone', label: language === 'es' ? 'Teléfono de emergencia' : 'Emergency phone', icon: '📞' }
        ];
      case 'cancellation_policies':
        return [
          { value: 'freeCancel24h', label: language === 'es' ? 'Cancelación gratuita 24h antes' : 'Free cancellation 24h before', icon: '✅' },
          { value: 'freeCancel48h', label: language === 'es' ? 'Cancelación gratuita 48h antes' : 'Free cancellation 48h before', icon: '✅' },
          { value: 'freeCancel7days', label: language === 'es' ? 'Cancelación gratuita 7 días antes' : 'Free cancellation 7 days before', icon: '✅' },
          { value: 'partialRefund', label: language === 'es' ? 'Reembolso parcial disponible' : 'Partial refund available', icon: '💰' },
          { value: 'noRefund', label: language === 'es' ? 'Sin reembolso' : 'No refund', icon: '❌' },
          { value: 'creditFuture', label: language === 'es' ? 'Crédito para futuras reservas' : 'Credit for future bookings', icon: '🎫' },
          { value: 'modificationAllowed', label: language === 'es' ? 'Se permite modificación de fechas' : 'Date modification allowed', icon: '📅' },
          { value: 'transferable', label: language === 'es' ? 'Reserva transferible' : 'Transferable booking', icon: '🔄' }
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [type, language]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        // Si no hay token, usar opciones hardcodeadas
        setOptions(getFallbackOptions());
        return;
      }

      const response = await fetch(getApiEndpoint(`/ConfigOptions/type/${type}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Si hay cualquier error (404, 401, 500, etc), usar opciones hardcodeadas
        console.log(`Using fallback options for ${type} (API returned ${response.status})`);
        setOptions(getFallbackOptions());
        return;
      }

      const data = await response.json();
      
      console.log(`📊 ConfigOptions received from API for type "${type}":`, data);
      
      // Mapear las opciones con el idioma correcto y todos los campos necesarios
      const mappedOptions = data.map((opt: ConfigOption) => ({
        ...opt, // Include all original fields
        value: opt.value,
        label: language === 'es' ? opt.labelEs : opt.labelEn,
        labelEs: opt.labelEs,
        labelEn: opt.labelEn,
        icon: opt.icon,
        iconType: opt.iconType,
        category: opt.category,
        isCustom: opt.isCustom,
        isActive: opt.isActive,
        sortOrder: opt.sortOrder
      }));
      
      console.log(`🔄 Mapped options for display:`, mappedOptions);

      setOptions(mappedOptions);
    } catch (err) {
      // En caso de error, usar opciones hardcodeadas silenciosamente
      console.log(`Using fallback options for ${type} (network error)`);
      setOptions(getFallbackOptions());
    } finally {
      setLoading(false);
    }
  };

  // Función para incrementar el uso de una opción
  const incrementUsage = async (value: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(getApiEndpoint(`/ConfigOptions/increment-usage`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, value })
      });
    } catch (err) {
      console.error('Error incrementing usage:', err);
    }
  };

  return { options, loading, error, incrementUsage };
}
