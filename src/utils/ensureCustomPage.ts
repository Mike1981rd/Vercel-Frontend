/**
 * Utility to ensure custom page exists for rooms
 */

export async function ensureCustomPageExists(companyId: number): Promise<boolean> {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/websitepages/company/${companyId}/ensure-custom`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('Failed to ensure custom page exists:', response.status);
      return false;
    }

    const page = await response.json();
    console.log('Custom page ensured:', page);
    return true;
  } catch (error) {
    console.error('Error ensuring custom page exists:', error);
    return false;
  }
}