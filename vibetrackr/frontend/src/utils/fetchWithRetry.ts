export async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries = 15,
    delay = 1000
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log("trying fetch")
        const res = await fetch(url, options);
        if (res.status === 503) throw new Error("Service Unavailable");
        return res;
      } catch (err) {
        if (i === retries - 1) throw err;
        const backoff = Math.min(delay * Math.pow(2, i), 30000);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
    throw new Error("Max retries exceeded");
  }
  