/**
 * 短地址
 * @param address 
 * @param chars 
 * @returns 
 */
// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
    return address ? `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}` : '';
}