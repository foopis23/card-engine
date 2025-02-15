export function getUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = self.crypto.randomUUID();
    localStorage.setItem("userId", userId);
  }

  return userId;
}
