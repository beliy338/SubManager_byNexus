// Demo test account for quick access (data stored in sessionStorage only during session)
export const testAccounts = [
  {
    email: 'demo@submanager.app',
    password: 'админ0',
    userId: 'demo-user',
    name: 'Demo User',
    isDemo: true
  }
];

export function findTestAccount(email: string, password: string) {
  return testAccounts.find(
    account => account.email === email && account.password === password
  );
}
