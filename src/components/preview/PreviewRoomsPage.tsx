'use client';

import React, { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/api-url';
import { ChevronLeft, ChevronRight, Star, Wifi, Car, Tv, Home, Shield, Medal, Clock, Check, X, Waves, Sparkles, DoorOpen, Key, Laptop, Award, Dumbbell, Wind, Bed, Grid3x3, MapPin } from 'lucide-react';
// Import additional icons for amenities
import { Coffee, Utensils } from 'lucide-react';

interface Room {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  comparePrice?: number;
  maxOccupancy: number;
  roomType: string;
  squareMeters: number;
  viewType: string;
  images: string[];
  amenities: string[];
  averageRating: number;
  totalReviews: number;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  sleepingArrangements?: any;
  houseRules?: any;
  cancellationPolicy?: any;
  checkInInstructions?: any;
  safetyFeatures?: any;
  highlightFeatures?: any;
  isSuperhost?: boolean;
  host?: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: string;
    bio: string;
    isSuperhost: boolean;
    overallRating: number;
    totalReviews: number;
    responseTimeMinutes: number;
    joinedDate: string;
    languages: string[];
    isVerified: boolean;
  };
}

interface PreviewRoomsPageProps {
  companyId?: number;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
}

// Amenity Icons Map
const amenityIcons: { [key: string]: React.ReactNode } = {
  'WiFi': <Wifi className="w-6 h-6" />,
  'Parking': <Car className="w-6 h-6" />,
  'TV': <Tv className="w-6 h-6" />,
  'Kitchen': <Utensils className="w-6 h-6" />,
  'Washer': <Wind className="w-6 h-6" />,
  'Air conditioning': <Wind className="w-6 h-6" />,
  'Pool': <Waves className="w-6 h-6" />,
  'Gym': <Dumbbell className="w-6 h-6" />,
  'Beach Access': <Waves className="w-6 h-6" />,
  'Hot Tub': <Sparkles className="w-6 h-6" />,
  'Dedicated workspace': <Laptop className="w-6 h-6" />,
  'Self check-in': <Key className="w-6 h-6" />,
};

export default function PreviewRoomsPage({ companyId = 1, deviceView, isEditor = false }: PreviewRoomsPageProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

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

  // Fetch rooms data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/rooms/company/${companyId}/public`);
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
          if (data.length > 0) {
            setSelectedRoom(data[0]); // Select first room by default
          }
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        // Use mock data for demo
        setRooms(getMockRooms());
        setSelectedRoom(getMockRooms()[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [companyId]);

  // Mock data for demo
  const getMockRooms = (): Room[] => {
    return [{
      id: 1,
      name: "Apartment Premium Pool Gym Playa luxury oceanview",
      description: "Enjoy a stylish experience at this centrally-located place. This modern apartment features a private pool, state-of-the-art gym, and all the amenities you need for an unforgettable stay. Perfect for families or groups looking for comfort and luxury.",
      basePrice: 110,
      comparePrice: 150,
      maxOccupancy: 4,
      roomType: "Entire apartment",
      squareMeters: 120,
      viewType: "Ocean View",
      images: [
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/f2563160-2ae7-4e77-ba23-ddc37eb69a16.jpeg?w=1200",
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/bd736170-1ade-409f-85f9-a83e607efa66.jpeg?w=800",
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/76e5f102-3099-42f5-997e-3fb1bb9c2c6e.jpeg?w=800",
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/889862f5-5804-4b68-ab1e-1edf2586105f.jpeg?w=800",
        "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/5d9241e9-ab07-444d-b476-f509f74a3df8.jpeg?w=800"
      ],
      amenities: ["WiFi", "Parking", "TV", "Kitchen", "Washer", "Air conditioning", "Pool", "Gym", "Beach Access", "Hot Tub"],
      averageRating: 5.0,
      totalReviews: 8,
      streetAddress: "Avenida Alemania",
      city: "Punta Cana",
      state: "La Altagracia",
      country: "Dominican Republic",
      neighborhood: "Bávaro, Punta Cana",
      latitude: 18.7763,
      longitude: -68.4185,
      sleepingArrangements: {
        bedrooms: 3,
        beds: 4,
        bathrooms: 3.5
      },
      houseRules: {
        checkIn: "3:00 PM",
        checkOut: "11:00 AM",
        selfCheckIn: true,
        noPets: false,
        noSmoking: true,
        noParties: true
      },
      highlightFeatures: [
        { icon: "pool", title: "Dive right in", description: "This is one of the few places in the area with a pool." },
        { icon: "calendar", title: "Free cancellation for 48 hours", description: "Get a full refund if you change your mind." },
        { icon: "workspace", title: "Dedicated workspace", description: "A room with wifi that's well-suited for working." }
      ],
      isSuperhost: true,
      host: {
        id: 1,
        firstName: "Carlos",
        lastName: "Rodriguez",
        profilePicture: "https://a0.muscache.com/im/users/18645566/profile_pic/1402436689/original.jpg?w=400",
        bio: "Hi! I'm Carlos, your host in paradise. I've been welcoming guests to Punta Cana for over 5 years and love sharing the best local spots and hidden gems. My team and I are always available to ensure your stay is perfect!",
        isSuperhost: true,
        overallRating: 5.0,
        totalReviews: 324,
        responseTimeMinutes: 60,
        joinedDate: "2016-06-01",
        languages: ["English", "Spanish", "French"],
        isVerified: true
      }
    }];
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    const nights = calculateNights();
    const subtotal = selectedRoom.basePrice * nights;
    const cleaningFee = 75;
    const serviceFee = Math.round(subtotal * 0.14);
    return subtotal + cleaningFee + serviceFee;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  if (!selectedRoom) {
    return <div className="min-h-screen flex items-center justify-center">No rooms available</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Photo Gallery Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="container mx-auto py-4">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="fixed top-4 left-4 bg-white rounded-full p-2 shadow-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-4">
              {selectedRoom.images.map((image, index) => (
                <img
                  key={index}
                  src={getImageUrl(image)}
                  alt={`Room ${index + 1}`}
                  className="w-full h-auto"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Gallery Section */}
      <div className={`${isMobile ? 'relative' : 'container mx-auto px-6 pt-6'}`}>
        {isMobile ? (
          // Mobile: Swipeable gallery (finger horizontal swipe)
          <div
            className="relative h-[300px] bg-gray-100 select-none"
            style={{ touchAction: 'pan-y' }}
            onTouchStart={(e) => {
              const t = e.touches[0];
              ;(e.currentTarget as any)._swipeStartX = t.clientX;
              ;(e.currentTarget as any)._swipeStartY = t.clientY;
              ;(e.currentTarget as any)._swipeHandled = false;
            }}
            onTouchMove={(e) => {
              const t = e.touches[0];
              const startX = (e.currentTarget as any)._swipeStartX || 0;
              const startY = (e.currentTarget as any)._swipeStartY || 0;
              const dx = t.clientX - startX;
              const dy = t.clientY - startY;
              if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 24) {
                (e.currentTarget as any)._swipeHandled = true;
              }
            }}
            onTouchEnd={(e) => {
              const startX = (e.currentTarget as any)._swipeStartX || 0;
              const handled = (e.currentTarget as any)._swipeHandled;
              const changed = e.changedTouches && e.changedTouches[0];
              if (!changed) return;
              const dx = changed.clientX - startX;
              if (handled && Math.abs(dx) > 24) {
                if (dx < 0) setCurrentImageIndex(prev => prev < selectedRoom.images.length - 1 ? prev + 1 : 0);
                else setCurrentImageIndex(prev => prev > 0 ? prev - 1 : selectedRoom.images.length - 1);
              }
            }}
          >
            <img
              src={getImageUrl(selectedRoom.images[currentImageIndex])}
              alt={selectedRoom.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
            />
            <button
              onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : selectedRoom.images.length - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentImageIndex(prev => prev < selectedRoom.images.length - 1 ? prev + 1 : 0)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {selectedRoom.images.slice(0, 5).map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          // Desktop: Grid layout - matching Airbnb exactly
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[560px] rounded-xl overflow-hidden relative">
            <div className="col-span-2 row-span-2">
              <img
                src={getImageUrl(selectedRoom.images[0])}
                alt={selectedRoom.name}
                className="w-full h-full object-cover hover:brightness-95 transition cursor-pointer"
                onClick={() => setShowAllPhotos(true)}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
              />
            </div>
            {selectedRoom.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={getImageUrl(image)}
                  alt={`Room ${index + 2}`}
                  className="w-full h-full object-cover hover:brightness-95 transition cursor-pointer"
                  onClick={() => setShowAllPhotos(true)}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                />
              </div>
            ))}
            <button
              onClick={() => setShowAllPhotos(true)}
              className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-lg border border-gray-900 flex items-center gap-2 hover:bg-gray-50 transition text-sm font-medium"
            >
              <Grid3x3 className="w-4 h-4" />
              Show all photos
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`${isMobile ? 'px-4' : 'max-w-[1280px] mx-auto px-10'} py-6`}>
        <div className={`${isMobile ? '' : 'grid grid-cols-[2fr_1fr] gap-20'}`}>
          {/* Left Content */}
          <div className={`${isMobile ? '' : 'col-span-2'}`}>
            {/* Title Section */}
            <div className="pb-8">
              <h1 className="text-[26px] font-semibold text-[#222222] leading-[30px] mb-1">
                {selectedRoom.name}
              </h1>
              <div className="flex flex-wrap items-center gap-1 text-[14px] mt-2">
                <div className="flex items-center">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  <span className="font-medium">{selectedRoom.averageRating}</span>
                </div>
                <span className="text-[#717171] mx-1">·</span>
                <button className="underline font-medium">{selectedRoom.totalReviews} reviews</button>
                <span className="text-[#717171] mx-1">·</span>
                <span className="font-medium">{selectedRoom.host?.isSuperhost ? <span className="flex items-center gap-1"><Medal className="w-3 h-3" />Superhost</span> : null}</span>
                {selectedRoom.host?.isSuperhost && <span className="text-[#717171] mx-1">·</span>}
                <button className="underline font-medium text-[#717171]">{selectedRoom.neighborhood}, {selectedRoom.city}, {selectedRoom.country}</button>
              </div>
            </div>

            {/* Host Section */}
            {selectedRoom.host && (
              <div className="py-8 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-[22px] font-medium text-[#222222] mb-2">
                      {selectedRoom.roomType} hosted by {selectedRoom.host.firstName}
                    </h2>
                    <div className="flex items-center gap-2 text-[16px] text-[#222222]">
                      <span>{selectedRoom.maxOccupancy} guests</span>
                      <span className="text-[#717171]">·</span>
                      <span>{selectedRoom.sleepingArrangements?.bedrooms || 2} bedrooms</span>
                      <span className="text-[#717171]">·</span>
                      <span>{selectedRoom.sleepingArrangements?.beds || 3} beds</span>
                      <span className="text-[#717171]">·</span>
                      <span>{selectedRoom.sleepingArrangements?.bathrooms || 2} baths</span>
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src={getImageUrl(selectedRoom.host.profilePicture)}
                      alt={selectedRoom.host.firstName}
                      className="w-14 h-14 rounded-full object-cover border border-gray-200"
                    />
                    {selectedRoom.host.isSuperhost && (
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full">
                        <Medal className="w-6 h-6 text-[#FF385C]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Highlights */}
            <div className="py-8 border-b border-gray-200 space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Waves className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-medium text-[16px] text-[#222222]">Dive right in</div>
                  <div className="text-[14px] text-[#717171] mt-1">This is one of the few places in the area with a pool.</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <DoorOpen className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-medium text-[16px] text-[#222222]">Self check-in</div>
                  <div className="text-[14px] text-[#717171] mt-1">Check yourself in with the keypad.</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-medium text-[16px] text-[#222222]">{selectedRoom.host?.firstName} is a Superhost</div>
                  <div className="text-[14px] text-[#717171] mt-1">Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-8 border-b border-gray-200">
              <p className="text-[16px] text-[#222222] leading-[24px]">
                {selectedRoom.description}
              </p>
              <button className="mt-4 font-semibold underline text-[16px]">Show more</button>
            </div>

            {/* Sleeping Arrangements */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-medium mb-6 text-[#222222]">Where you'll sleep</h2>
              <div className="overflow-x-auto">
                <div className="flex gap-4" style={{ minWidth: isMobile ? '100%' : 'auto' }}>
                  <div className="flex-shrink-0 w-[280px]">
                    <img 
                      src="https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/76e5f102-3099-42f5-997e-3fb1bb9c2c6e.jpeg?w=720" 
                      alt="Bedroom"
                      className="w-full h-[185px] object-cover rounded-lg mb-3"
                    />
                    <div className="font-medium text-[16px] text-[#222222]">Bedroom</div>
                    <div className="text-[14px] text-[#717171]">1 queen bed</div>
                  </div>
                  <div className="flex-shrink-0 w-[280px]">
                    <img 
                      src="https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/1bbaced6-1fc0-45e3-be11-68d4ee90f934.jpeg?w=720" 
                      alt="Living room"
                      className="w-full h-[185px] object-cover rounded-lg mb-3"
                    />
                    <div className="font-medium text-[16px] text-[#222222]">Living room</div>
                    <div className="text-[14px] text-[#717171]">1 sofa bed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What this place offers */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-medium mb-6 text-[#222222]">What this place offers</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center gap-4">
                  <Waves className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">Ocean view</span>
                </div>
                <div className="flex items-center gap-4">
                  <Wifi className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">Wifi</span>
                </div>
                <div className="flex items-center gap-4">
                  <Waves className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">Pool</span>
                </div>
                <div className="flex items-center gap-4">
                  <Car className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">Free parking on premises</span>
                </div>
                <div className="flex items-center gap-4">
                  <Wind className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">Air conditioning</span>
                </div>
                <div className="flex items-center gap-4">
                  <Laptop className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">Dedicated workspace</span>
                </div>
                <div className="flex items-center gap-4">
                  <Tv className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">TV</span>
                </div>
                <div className="flex items-center gap-4">
                  <Wind className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">Washer</span>
                </div>
                <div className="flex items-center gap-4">
                  <Utensils className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">Kitchen</span>
                </div>
                <div className="flex items-center gap-4">
                  <Dumbbell className="w-6 h-6" />
                  <span className="text-[16px] text-[#222222]">Gym</span>
                </div>
              </div>
              <button className="mt-8 px-6 py-3 border border-[#222222] rounded-lg font-medium hover:bg-gray-50 transition text-[16px]">
                Show all 37 amenities
              </button>
            </div>

            {/* Calendar Section */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-medium mb-2 text-[#222222]">Select check-in date</h2>
              <div className="text-[14px] text-[#717171] mb-6">Add your travel dates for exact pricing</div>
              
              {/* Calendar Visual */}
              <div className="flex gap-8">
                {/* October 2025 */}
                <div className="flex-1">
                  <div className="text-center font-medium text-[14px] mb-4">October 2025</div>
                  <div className="grid grid-cols-7 gap-1 text-[12px]">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-center py-2 text-[#717171] font-medium">{day}</div>
                    ))}
                    {/* Calendar days */}
                    {[...Array(31)].map((_, i) => (
                      <div key={i} className="text-center py-2 hover:border hover:border-black hover:rounded-full cursor-pointer text-[14px]">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* November 2025 */}
                <div className="flex-1">
                  <div className="text-center font-medium text-[14px] mb-4">November 2025</div>
                  <div className="grid grid-cols-7 gap-1 text-[12px]">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-center py-2 text-[#717171] font-medium">{day}</div>
                    ))}
                    {/* Calendar days */}
                    {[...Array(30)].map((_, i) => (
                      <div key={i} className="text-center py-2 hover:border hover:border-black hover:rounded-full cursor-pointer text-[14px]">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <button className="text-[14px] underline font-medium">Clear dates</button>
                <div className="flex items-center gap-4 text-[12px]">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    <span>Navigate with keyboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Booking Card */}
          {!isMobile && (
            <div className="col-span-1">
              <div className="sticky top-6">
                <div className="border border-gray-300 rounded-xl shadow-xl p-6 bg-white">
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-[22px] font-semibold text-[#222222]">${selectedRoom.basePrice}</span>
                    <span className="text-[16px] text-[#222222]">night</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-[14px] font-medium">{selectedRoom.averageRating}</span>
                    <span className="text-[#717171] text-[14px] mx-1">·</span>
                    <button className="text-[14px] text-[#717171] underline">{selectedRoom.totalReviews} reviews</button>
                  </div>

                  {/* Date Inputs */}
                  <div className="border border-gray-400 rounded-lg mb-4">
                    <div className="grid grid-cols-2">
                      <div className="p-3 border-r border-gray-400">
                        <label className="text-[10px] font-semibold uppercase tracking-wider">Check-in</label>
                        <input
                          type="text"
                          placeholder="Add date"
                          value={checkInDate ? new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="w-full mt-0.5 text-[14px] focus:outline-none placeholder-gray-400"
                        />
                      </div>
                      <div className="p-3">
                        <label className="text-[10px] font-semibold uppercase tracking-wider">Checkout</label>
                        <input
                          type="text"
                          placeholder="Add date"
                          value={checkOutDate ? new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="w-full mt-0.5 text-[14px] focus:outline-none placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-400 relative">
                      <label className="text-[10px] font-semibold uppercase tracking-wider">Guests</label>
                      <button
                        onClick={() => setShowGuestPicker(!showGuestPicker)}
                        className="w-full mt-0.5 text-[14px] text-left focus:outline-none"
                      >
                        {guests} {guests === 1 ? 'guest' : 'guests'}
                      </button>
                      
                      {showGuestPicker && (
                        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-xl p-4 mt-2 z-10">
                          <div className="flex items-center justify-between">
                            <span>Guests</span>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setGuests(Math.max(1, guests - 1))}
                                className="w-8 h-8 rounded-full border flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{guests}</span>
                              <button
                                onClick={() => setGuests(Math.min(selectedRoom.maxOccupancy, guests + 1))}
                                className="w-8 h-8 rounded-full border flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reserve Button */}
                  <button className="w-full py-[14px] bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white font-semibold rounded-lg hover:from-[#D70466] hover:to-[#BD1E59] transition text-[16px]">
                    Reserve
                  </button>

                  {/* Price Breakdown */}
                  {checkInDate && checkOutDate && calculateNights() > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="underline">${selectedRoom.basePrice} x {calculateNights()} nights</span>
                        <span>${selectedRoom.basePrice * calculateNights()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="underline">Cleaning fee</span>
                        <span>$75</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="underline">Service fee</span>
                        <span>${Math.round(selectedRoom.basePrice * calculateNights() * 0.14)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total before taxes</span>
                        <span>${calculateTotal()}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-500 mt-4">
                    You won't be charged yet
                  </div>
                </div>

                {/* Report Listing */}
                <button className="w-full mt-4 py-2 text-sm text-gray-500 underline flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Report this listing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="py-8 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-8">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-[22px] font-medium">{selectedRoom.averageRating}</span>
            <span className="text-[22px] text-[#717171]">·</span>
            <span className="text-[22px] font-medium">{selectedRoom.totalReviews} reviews</span>
          </div>

          {/* Rating Categories */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-y-4 gap-x-24 mb-8 pr-12`}>
            {[
              { label: 'Cleanliness', value: 5.0 },
              { label: 'Accuracy', value: 5.0 },
              { label: 'Check-in', value: 5.0 },
              { label: 'Communication', value: 5.0 },
              { label: 'Location', value: 4.8 },
              { label: 'Value', value: 5.0 }
            ].map((category) => (
              <div key={category.label} className="flex items-center justify-between">
                <span className="text-[14px] text-[#222222]">{category.label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-[116px] bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-[#222222] h-1 rounded-full"
                      style={{ width: `${(category.value / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold w-6 text-[#222222]">{category.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sample Reviews */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-x-24 gap-y-10 mb-8`}>
            <div>
              <div className="flex items-start gap-3 mb-3">
                <img
                  src="https://a0.muscache.com/im/pictures/user/c73b0b73-ac8a-4f58-ac2d-2688bb402e2f.jpg?w=120"
                  alt="Reviewer"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium text-[16px] text-[#222222]">Carmen</div>
                  <div className="text-[14px] text-[#717171]">4 years on Airbnb</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
                <span className="text-[14px] ml-1">· December 2024</span>
              </div>
              <p className="text-[16px] text-[#222222] leading-[24px]">
                This place is a gem! Great location, very clean and comfortable. The host was super responsive and helpful. Would definitely stay here again!
              </p>
            </div>
            
            <div>
              <div className="flex items-start gap-3 mb-3">
                <img
                  src="https://a0.muscache.com/im/pictures/user/87ed8877-fc42-4beb-b602-d88a36faaa76.jpg?w=120"
                  alt="Reviewer"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium text-[16px] text-[#222222]">David</div>
                  <div className="text-[14px] text-[#717171]">1 year on Airbnb</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
                <span className="text-[14px] ml-1">· November 2024</span>
              </div>
              <p className="text-[16px] text-[#222222] leading-[24px]">
                Amazing stay! The apartment was exactly as described and the location couldn't be better. Pool and gym were great bonuses.
              </p>
            </div>
          </div>

          <button className="px-6 py-3 border border-[#222222] rounded-lg font-medium hover:bg-gray-50 transition text-[16px]">
            Show all {selectedRoom.totalReviews} reviews
          </button>
        </div>

        {/* Map Section */}
        <div className="py-8 border-t">
          <h2 className="text-2xl font-semibold mb-4">Where you'll be</h2>
          <div className="mb-4">
            <p className="text-gray-700">{selectedRoom.neighborhood}, {selectedRoom.city}, {selectedRoom.country}</p>
          </div>
          
          {/* Map Placeholder */}
          <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center relative">
            <MapPin className="w-8 h-8 text-[#FF385C]" />
            <span className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow text-sm">
              Exact location provided after booking
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-gray-700">
              {selectedRoom.description}
            </p>
            <button className="font-medium underline">Show more</button>
          </div>
        </div>

        {/* Meet your Host Section */}
        {selectedRoom.host && (
          <div className="py-8 border-t border-gray-200">
            <h2 className="text-[22px] font-medium mb-6 text-[#222222]">Meet your Host</h2>
            <div className="flex gap-16">
              {/* Host Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 max-w-[380px]">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <img
                      src={getImageUrl(selectedRoom.host.profilePicture)}
                      alt={selectedRoom.host.firstName}
                      className="w-[128px] h-[128px] rounded-full object-cover"
                    />
                    {selectedRoom.host.isSuperhost && (
                      <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                        <Medal className="w-8 h-8 text-[#FF385C]" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-[32px] font-bold">{selectedRoom.host.firstName}</h3>
                  <div className="text-[14px] font-medium text-[#717171]">Superhost</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-8 pb-8 border-b border-gray-200">
                  <div className="text-left">
                    <div className="text-[22px] font-bold">{selectedRoom.host.totalReviews}</div>
                    <div className="text-[10px] text-[#717171]">Reviews</div>
                  </div>
                  <div className="text-center border-x border-gray-200">
                    <div className="text-[22px] font-bold flex items-center justify-center">
                      {selectedRoom.host.overallRating}
                      <Star className="w-4 h-4 ml-0.5 fill-current" />
                    </div>
                    <div className="text-[10px] text-[#717171]">Rating</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[22px] font-bold">7</div>
                    <div className="text-[10px] text-[#717171]">Years hosting</div>
                  </div>
                </div>
                
                {/* Co-hosts */}
                <div className="mt-6">
                  <h4 className="font-semibold text-[16px] mb-4">Co-hosts</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src="https://a0.muscache.com/im/pictures/user/87ed8877-fc42-4beb-b602-d88a36faaa76.jpg?w=60"
                      alt="Luis"
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="text-[16px]">Luis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src="https://a0.muscache.com/im/pictures/user/c73b0b73-ac8a-4f58-ac2d-2688bb402e2f.jpg?w=60"
                      alt="Ana"
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="text-[16px]">Ana</span>
                  </div>
                </div>
              </div>
              
              {/* Host Info */}
              <div className="flex-1 max-w-[460px]">
                <div className="mb-6">
                  <h3 className="text-[22px] font-medium mb-4">{selectedRoom.host.firstName} is a Superhost</h3>
                  <p className="text-[16px] text-[#717171] leading-[24px] mb-4">
                    Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                  </p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 mt-0.5" />
                    <div>
                      <div className="font-medium text-[16px]">Awards</div>
                      <div className="text-[14px] text-[#717171]">Superhost for 3 years</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 mt-0.5" />
                    <div>
                      <div className="font-medium text-[16px]">Identity verification</div>
                      <div className="text-[14px] text-[#717171]">Identity, email and phone number verified</div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h3 className="text-[18px] font-medium mb-4">Host details</h3>
                  <div className="space-y-2 text-[16px] text-[#222222]">
                    <p>Response rate: 100%</p>
                    <p>Response time: within an hour</p>
                  </div>
                </div>
                
                <button className="w-full px-6 py-3 bg-[#222222] text-white rounded-lg font-semibold hover:bg-black transition text-[16px]">
                  Message Host
                </button>
                
                <div className="mt-6 pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#FF385C] flex-shrink-0 mt-1" />
                    <p className="text-[12px] text-[#717171] leading-[18px]">
                      To protect your payment, never transfer money or communicate outside of the Airbnb website or app.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Things to Know - Removed hardcoded section, should be handled by room_things module */}
      </div>

      {/* Mobile Sticky Footer */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-lg">${selectedRoom.basePrice}</span>
                <span className="text-sm text-gray-600">night</span>
              </div>
              <button className="text-sm underline">
                {checkInDate && checkOutDate ? `${calculateNights()} nights` : 'Select dates'}
              </button>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white font-medium rounded-lg">
              Reserve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
