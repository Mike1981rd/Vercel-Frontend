'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Star, Award, MessageSquare, Check } from 'lucide-react';
import { fetchRoomData } from '@/lib/api/rooms';

interface RoomHostCardConfig {
  enabled: boolean;
  title: string;
  hostName?: string;
  hostImage?: string;
  hostSince?: string;
  reviewCount?: number;
  rating?: number;
  responseRate?: number;
  responseTime?: string;
  isSuperhost?: boolean;
  isVerified?: boolean;
  bio?: string;
  languages?: string[];
  work?: string;
  location?: string;
  showMessageButton?: boolean;
  // Card visibility settings
  showHostIdCard?: boolean;
  showBioCard?: boolean;
  showDetailsStatsCard?: boolean;
  showAttributesHobbiesCard?: boolean;
  // Style settings
  buttonColor?: string;
  buttonTextColor?: string;
  cardColor?: string;
  cardTextColor?: string;
  cardBorderColor?: string;
  borderRadius?: number;
  typography?: string;
  fontSize?: string;
  fontWeight?: string;
  topPadding?: number;
  bottomPadding?: number;
}

interface PreviewRoomHostCardProps {
  config: RoomHostCardConfig;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
  theme?: any;
}

export default function PreviewRoomHostCard({ 
  config, 
  deviceView, 
  isEditor = false,
  theme 
}: PreviewRoomHostCardProps) {
  
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  const [roomData, setRoomData] = useState<any>(null);
  const [hostData, setHostData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [deviceView]);

  // Load Google Font if specified
  useEffect(() => {
    if (config.typography && config.typography !== 'font-sans' && config.typography !== 'font-serif' && config.typography !== 'font-mono') {
      const fontName = config.typography.replace(' ', '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [config.typography]);

  // Auto-fetch room data for both editor and preview
  useEffect(() => {
    const loadRoomData = async () => {
      const companyId = localStorage.getItem('companyId') || '1';
      
      setLoading(true);
      try {
        // Use helper function that checks for slug
        const data = await fetchRoomData(companyId);
        if (data) {
          console.log('Room host data:', data.host); // Debug log
          setRoomData(data);
          
          // If room has hostId, fetch complete host data
          if (data.hostId) {
            try {
              const hostResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/hosts/by-room/${data.id}`
              );
              if (hostResponse.ok) {
                const fullHostData = await hostResponse.json();
                console.log('Full host data fetched:', fullHostData); // Debug log
                setHostData(fullHostData);
              }
            } catch (hostError) {
              console.error('Error fetching host data:', hostError);
              setHostData(data.host);
            }
          } else if (data.host) {
            setHostData(data.host);
          }
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch in both editor and preview modes
    if (config.enabled) {
      loadRoomData();
    }
  }, [config.enabled]);

  if (!config.enabled) {
    return null;
  }

  // Use host data from fetch or fallback to room data/config
  const currentHost = hostData || roomData?.host;
  
  // Calculate years hosting
  const getHostingYears = () => {
    const currentYear = new Date().getFullYear();
    
    if (currentHost?.yearStartedHosting) {
      return currentHost.yearStartedHosting;
    }
    
    if (currentHost?.joinedDate) {
      return new Date(currentHost.joinedDate).getFullYear();
    }
    
    return currentYear;
  };
  
  const displayData: any = currentHost ? {
    ...config,
    hostName: currentHost.fullName || currentHost.firstName || config.hostName,
    hostImage: currentHost.profilePicture || config.hostImage,
    isVerified: currentHost.isVerified ?? config.isVerified,
    isSuperhost: currentHost.isSuperhost ?? config.isSuperhost,
    bio: currentHost.bio || config.bio,
    aboutMe: currentHost.aboutMe || '',
    location: currentHost.location || currentHost.city || config.location,
    work: currentHost.work || config.work,
    languages: currentHost.languages || config.languages || [],
    attributes: currentHost.attributes || [],
    hobbies: currentHost.hobbies || [],
    hostSince: getHostingYears().toString(),
    responseTime: currentHost.responseTimeMinutes || config.responseTime,
    acceptanceRate: currentHost.acceptanceRate || config.responseRate,
    reviewCount: currentHost.totalReviews || config.reviewCount,
    rating: currentHost.overallRating || config.rating
  } : config;

  // Extract style settings with defaults
  const styles = {
    buttonColor: config.buttonColor || '#2563eb',
    buttonTextColor: config.buttonTextColor || '#ffffff',
    cardColor: config.cardColor || '#ffffff',
    cardTextColor: config.cardTextColor || '#111827',
    cardBorderColor: config.cardBorderColor || '#e5e7eb',
    borderRadius: config.borderRadius || 12,
    typography: config.typography || 'Roboto',
    fontSize: config.fontSize || 'text-base',
    fontWeight: config.fontWeight || 'font-normal',
    topPadding: config.topPadding || 32,
    bottomPadding: config.bottomPadding || 32
  };
  
  // Build font family string
  const fontFamily = styles.typography === 'font-sans' ? 'sans-serif' :
                    styles.typography === 'font-serif' ? 'serif' :
                    styles.typography === 'font-mono' ? 'monospace' :
                    `'${styles.typography}', sans-serif`;

  return (
    <div 
      className={`container mx-auto ${isMobile ? 'px-4' : 'px-6'} border-t`}
      style={{ 
        paddingTop: `${styles.topPadding}px`,
        paddingBottom: `${styles.bottomPadding}px`,
        fontFamily: fontFamily
      }}
    >
      <h2 className={`${isMobile ? 'text-lg text-center' : 'text-xl'} font-semibold mb-6`}>
        {displayData.title || 'Conoce a tu anfitrión'}
      </h2>

      {/* Check if all cards are hidden */}
      {config.showHostIdCard === false && 
       config.showBioCard === false && 
       config.showDetailsStatsCard === false && 
       config.showAttributesHobbiesCard === false ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay tarjetas de información del anfitrión habilitadas. Por favor, habilita al menos una tarjeta para mostrar la información del anfitrión.</p>
        </div>
      ) : (
      <div className="space-y-8">
        {/* Top section with host card and other info cards */}
        <div className={`${isMobile ? 'flex flex-col gap-6' : 'grid lg:grid-cols-2 gap-8'}`}>
          {/* Left column - Host cards stacked */}
          <div className={`flex flex-col gap-4 ${isMobile ? 'w-full' : ''}`}>
            {/* Host ID card */}
            {config.showHostIdCard !== false && (
            <div 
              className="shadow-xl overflow-hidden flex-1"
              style={{ 
                minHeight: isMobile ? '200px' : '240px',
                backgroundColor: styles.cardColor,
                borderRadius: `${styles.borderRadius}px`,
                border: `2px solid ${styles.cardBorderColor}`
              }}>
              <div className={`${isMobile ? 'flex flex-col' : 'flex'} h-full`}>
                {/* Left side - Photo */}
                <div className={`${isMobile ? 'w-full' : 'w-44'} bg-gradient-to-b from-gray-50 to-gray-100 ${isMobile ? 'p-3' : 'p-4'} flex ${isMobile ? 'flex-row' : 'flex-col'} items-center justify-center`}>
                  <div className="relative">
                    <img
                      src={displayData.hostImage || 'https://a0.muscache.com/defaults/user_pic-225x225.png?v=3'}
                      alt={displayData.hostName}
                      className={`${isMobile ? 'w-[80px] h-[80px]' : 'w-[120px] h-[120px]'} rounded-lg object-cover shadow-md ring-2 ring-white/50`}
                      loading="eager"
                      decoding="sync"
                      fetchPriority="high"
                      style={{ 
                        imageRendering: '-webkit-optimize-contrast',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'translateZ(0)'
                      }}
                    />
                    {displayData.isSuperhost && (
                      <div className={`absolute ${isMobile ? '-top-1 -right-1' : '-top-2 -right-2'} bg-gradient-to-r from-red-500 to-rose-500 rounded-full ${isMobile ? 'p-1' : 'p-1.5'} shadow-lg`}>
                        <Award className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                      </div>
                    )}
                  </div>
                  {isMobile ? (
                    <div className="ml-4 flex-1">
                      <p className="text-xs font-bold text-gray-700 tracking-wide">ID ANFITRIÓN</p>
                      <h3 className="text-base font-bold mt-1" style={{ color: styles.cardTextColor }}>{displayData.hostName || 'Host'}</h3>
                      {displayData.isSuperhost && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full">SÚPER ANFITRIÓN</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs font-bold mt-3 text-gray-700 tracking-wide">ID ANFITRIÓN</p>
                  )}
                </div>

                {/* Right side - Info */}
                <div className={`flex-1 ${isMobile ? 'p-3' : 'p-4'} flex flex-col justify-between`}>
                  {/* Header - Hide on mobile as it's shown above */}
                  {!isMobile && (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium" style={{ color: styles.cardTextColor, opacity: 0.7 }}>Anfitrión Certificado</p>
                        <h3 className={`text-base font-bold ${styles.fontSize} ${styles.fontWeight}`} style={{ color: styles.cardTextColor }}>{displayData.hostName || 'Host'}</h3>
                      </div>
                      {displayData.isSuperhost && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full">SÚPER ANFITRIÓN</span>
                      )}
                    </div>
                  )}

                  {/* Details Grid - No dividers */}
                  <div className={`grid grid-cols-3 ${isMobile ? 'gap-x-3' : 'gap-x-4'} gap-y-1 ${isMobile ? 'mt-0' : 'mt-2.5'}`}>
                    <div className={isMobile ? 'text-center' : ''}>
                      <p className="text-xs" style={{ color: styles.cardTextColor, opacity: 0.6 }}>Calificación</p>
                      <p className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: styles.cardTextColor }}>{displayData.rating || 'N/A'} ⭐</p>
                    </div>
                    <div className={isMobile ? 'text-center' : ''}>
                      <p className="text-xs" style={{ color: styles.cardTextColor, opacity: 0.6 }}>Reseñas</p>
                      <p className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: styles.cardTextColor }}>{displayData.reviewCount || 0}</p>
                    </div>
                    <div className={isMobile ? 'text-center' : ''}>
                      <p className="text-xs" style={{ color: styles.cardTextColor, opacity: 0.6 }}>Desde</p>
                      <p className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: styles.cardTextColor }}>{displayData.hostSince || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Bottom section - No border */}
                  <div className={`flex ${isMobile ? 'flex-col items-center gap-1' : 'justify-between items-center'} mt-2.5`}>
                    <div className={`flex items-center ${isMobile ? 'flex-col' : 'gap-2'}`}>
                      {displayData.isVerified && (
                        <div className="flex items-center gap-1">
                          <Shield className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'} text-green-600`} />
                          <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-semibold text-green-600`}>VERIFICADO</span>
                        </div>
                      )}
                      <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400`}>ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Bio Card - Matching height */}
            {config.showBioCard !== false && (
            <div 
              className="shadow-xl overflow-hidden flex-1"
              style={{ 
                minHeight: isMobile ? '180px' : '240px',
                backgroundColor: styles.cardColor,
                borderRadius: `${styles.borderRadius}px`,
                border: `2px solid ${styles.cardBorderColor}`
              }}>
              <div className={`${isMobile ? 'p-4' : 'p-6'} h-full flex flex-col`}>
                <h3 className={`font-bold ${isMobile ? 'mb-2 text-base text-center' : 'mb-3 text-lg'} ${styles.fontWeight}`} style={{ color: styles.cardTextColor }}>Acerca de {displayData.hostName}</h3>
                <div className="flex-1 overflow-y-auto">
                  {(displayData.bio || displayData.aboutMe) ? (
                    <>
                      {displayData.bio && (
                        <p className={`mb-3 leading-relaxed text-sm ${styles.fontSize}`} style={{ color: styles.cardTextColor, opacity: 0.9 }}>{displayData.bio}</p>
                      )}
                      {displayData.aboutMe && (
                        <p className={`text-sm leading-relaxed ${styles.fontSize}`} style={{ color: styles.cardTextColor, opacity: 0.8 }}>{displayData.aboutMe}</p>
                      )}
                    </>
                  ) : (
                    <p className={`text-sm leading-relaxed ${styles.fontSize}`} style={{ color: styles.cardTextColor, opacity: 0.7 }}>
                      {displayData.hostName} aún no ha escrito una biografía.
                    </p>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Right column - Other info cards */}
          <div className={`flex flex-col gap-4 ${isMobile ? 'w-full' : ''}`}>

          {/* Details & Stats Card */}
          {config.showDetailsStatsCard !== false && (
          <div className={`bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-xl shadow-xl ${isMobile ? 'p-4' : 'p-5'} flex-1`} style={{ minHeight: isMobile ? '150px' : '180px' }}>
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
              {/* Left Column - Personal Info */}
              <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                <h4 className={`font-bold text-gray-900 ${isMobile ? 'text-sm text-center' : 'text-sm'} uppercase tracking-wide`}>Personal</h4>
                {displayData.location && (
                  <div className={`text-sm ${isMobile ? 'text-center' : ''}`}>
                    <p className="text-gray-500 text-xs">Ubicación</p>
                    <p className="font-semibold text-gray-900">{displayData.location}</p>
                  </div>
                )}
                {displayData.work && (
                  <div className={`text-sm ${isMobile ? 'text-center' : ''}`}>
                    <p className="text-gray-500 text-xs">Trabajo</p>
                    <p className="font-semibold text-gray-900">{displayData.work}</p>
                  </div>
                )}
                {displayData.languages && displayData.languages.length > 0 && (
                  <div className={`text-sm ${isMobile ? 'text-center' : ''}`}>
                    <p className="text-gray-500 text-xs">Idiomas</p>
                    <p className="font-semibold text-gray-900">
                      {Array.isArray(displayData.languages) 
                        ? displayData.languages.join(', ')
                        : displayData.languages}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Host Stats */}
              <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                <h4 className={`font-bold text-gray-900 ${isMobile ? 'text-sm text-center' : 'text-sm'} uppercase tracking-wide`}>Estadísticas</h4>
                {displayData.acceptanceRate > 0 && (
                  <div className={`text-sm ${isMobile ? 'text-center' : ''}`}>
                    <p className="text-gray-500 text-xs">Tasa de Respuesta</p>
                    <p className="font-semibold text-gray-900">{displayData.acceptanceRate}%</p>
                  </div>
                )}
                {displayData.responseTime && (
                  <div className={`text-sm ${isMobile ? 'text-center' : ''}`}>
                    <p className="text-gray-500 text-xs">Tiempo de Respuesta</p>
                    <p className="font-semibold text-gray-900">
                      {typeof displayData.responseTime === 'number' 
                        ? `${displayData.responseTime} min`
                        : displayData.responseTime}
                    </p>
                  </div>
                )}
                {displayData.hostSince && (
                  <div className={`text-sm ${isMobile ? 'text-center' : ''}`}>
                    <p className="text-gray-500 text-xs">Anfitrión Desde</p>
                    <p className="font-semibold text-gray-900">{displayData.hostSince}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

            {/* Attributes & Hobbies Card */}
            {config.showAttributesHobbiesCard !== false && (
            <div className={`bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-xl shadow-xl ${isMobile ? 'p-4' : 'p-5'} flex-1`} style={{ minHeight: isMobile ? '150px' : '180px' }}>
                {(displayData.attributes && displayData.attributes.length > 0) || (displayData.hobbies && displayData.hobbies.length > 0) ? (
                  <>
                    {displayData.attributes && displayData.attributes.length > 0 && (
                      <div className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
                        <h4 className={`font-bold text-gray-900 ${isMobile ? 'text-sm text-center' : 'text-sm'} uppercase tracking-wide mb-2`}>Atributos</h4>
                        <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
                          {displayData.attributes.map((attr: string, index: number) => (
                            <span key={index} className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} bg-white/80 backdrop-blur rounded-full font-medium text-gray-700 shadow-sm`}>
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {displayData.hobbies && displayData.hobbies.length > 0 && (
                      <div>
                        <h4 className={`font-bold text-gray-900 ${isMobile ? 'text-sm text-center' : 'text-sm'} uppercase tracking-wide mb-2`}>Pasatiempos</h4>
                        <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
                          {displayData.hobbies.map((hobby: string, index: number) => (
                            <span key={index} className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} bg-blue-100/80 backdrop-blur text-blue-700 rounded-full font-medium shadow-sm`}>
                              {hobby}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">No hay atributos o pasatiempos listados aún</p>
                  </div>
                )}
              </div>
              )}

          </div>
        </div>

        {/* Message Host Button - Centered at bottom */}
        {config.showMessageButton !== false && (
          <div className={`flex justify-center ${isMobile ? 'mt-6' : 'mt-8'}`}>
            <div className={`w-full ${isMobile ? 'max-w-full' : 'max-w-md'}`}>
              <button 
                className={`w-full flex items-center justify-center gap-2 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'} font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                style={{
                  backgroundColor: styles.buttonColor,
                  color: styles.buttonTextColor,
                  borderRadius: `${Math.min(styles.borderRadius, 12)}px`,
                  fontSize: isMobile ? '14px' : '16px'
                }}
              >
                <MessageSquare className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                Enviar Mensaje
              </button>
              
              <div className={`${isMobile ? 'mt-3 p-2' : 'mt-4 p-3'} bg-gray-50 rounded-lg`}>
                <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-600 flex items-start gap-1 text-center`}>
                  <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Para proteger tu pago, nunca transfieras dinero ni te comuniques fuera del sitio web o la aplicación.</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}