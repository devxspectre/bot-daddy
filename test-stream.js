
const query = "What is the return policy?";
const apiKey = "bd_live_p1LhQGF5CWMllsAS4caMnsCkrVzRPaRG";
const chatbotId = "cyp98hzarj475vcp8oxnftze";

async function testStreaming() {
  console.log("Testing streaming...");
  try {
    const response = await fetch("http://localhost:3001/api/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, apiKey, chatbotId }),
    });

    if (!response.ok) {
      console.error("Response not OK:", response.status, await response.text());
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    console.log("Stream started:");
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("\nStream finished.");
        break;
      }
      const chunk = decoder.decode(value);
      process.stdout.write(chunk);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testStreaming();
