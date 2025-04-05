export const getName = (user: { username: string; displayUsername: string }) =>
  user.displayUsername ?? user.username
