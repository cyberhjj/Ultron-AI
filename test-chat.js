const messages = [
  { role: "user", content: "ping localhost", id: "msg1" }
];

fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages })
})
.then(async res => {
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.slice(0, 200));
})
.catch(console.error);
