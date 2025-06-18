export async function getUser() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/user/me", {
      // forward cookies
      credentials: "include",
      // never cache because auth can change any time
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    console.log("Fetched user:", data);
    return data.user; // { id, email, ... }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
