import { POST } from './src/app/api/chat/route';

async function main() {
  const mockReq = new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Hello' }
      ]
    })
  });

  try {
    console.log("Invoking POST handler...");
    const res = await POST(mockReq);
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const bodyText = await res.text();
    console.log("Body preview:", bodyText.slice(0, 500));
  } catch (e) {
    console.error("CAUGHT EXCEPTION:");
    console.error(e);
  }
}

main();
