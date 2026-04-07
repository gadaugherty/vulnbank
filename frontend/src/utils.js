export function maskAccount(accountNumber) {
  if (!accountNumber) return '****-****-****';
  const parts = accountNumber.split('-');
  if (parts.length === 3) {
    return `****-${parts[1]}-${parts[2]}`;
  }
  return accountNumber;
}
