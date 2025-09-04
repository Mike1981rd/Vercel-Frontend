// Helper functions for room API calls
import { getApiUrl } from '@/lib/api-url';

export async function fetchRoomData(companyId: string | number) {
  // Check if we have a specific room slug in localStorage (set by the preview page)
  const roomSlug = localStorage.getItem('currentRoomSlug');
  
  try {
    let response;
    
    if (roomSlug) {
      // Fetch specific room by slug
      console.log('Fetching room by slug:', roomSlug);
      response = await fetch(`${getApiUrl()}/rooms/company/${companyId}/slug/${roomSlug}`);
    } else {
      // Fallback to first active room (for editor mode)
      console.log('Fetching first active room for editor');
      response = await fetch(`${getApiUrl()}/rooms/company/${companyId}/first-active`);
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('Room data fetched:', data);
      return data;
    } else {
      console.error('Failed to fetch room data:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching room data:', error);
    return null;
  }
}

export async function fetchAllRooms(companyId: string | number) {
  try {
    const response = await fetch(`${getApiUrl()}/rooms/company/${companyId}/public`);
    
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    return [];
  }
}
