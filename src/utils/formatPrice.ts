/**
 * Formats a price with thousand separators and 2 decimal places
 * @param amount - The numeric amount to format
 * @param currency - The currency code (e.g., 'USD', 'DOP')
 * @returns Formatted price string like "$1,500.00 DOP"
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  // Format number with thousand separators and 2 decimal places
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Always use $ symbol with currency code
  return currency === 'USD' 
    ? `$${formattedAmount}` 
    : `$${formattedAmount} ${currency}`;
}

/**
 * Formats a price range or single price
 * @param amount - The numeric amount to format
 * @param currency - The currency code
 * @param suffix - Optional suffix text (e.g., "per night", "for 3 nights")
 * @returns Formatted price string with optional suffix
 */
export function formatPriceWithSuffix(
  amount: number, 
  currency: string = 'USD', 
  suffix?: string
): string {
  const price = formatPrice(amount, currency);
  return suffix ? `${price} ${suffix}` : price;
}