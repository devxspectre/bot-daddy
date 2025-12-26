import { generateEmbedding, generateText, generateTextStream } from "./index";

async function test() {
  console.log("--- Testing Embeddings ---");
  try {
    const embedding = await generateEmbedding("Hello world");
    console.log("Embedding length:", embedding.length);
    console.log("First 5 values:", embedding.slice(0, 5));
  } catch (e) {
    console.error("Embedding failed:", e);
  }

  console.log("\n--- Testing Text Generation ---");
  try {
    const text = await generateText("Say hello to the user");
    console.log("Response:", text);
  } catch (e) {
    console.error("Text generation failed:", e);
  }

  console.log("\n--- Testing Streaming ---");
  try {
    process.stdout.write("Response: ");
    for await (const token of generateTextStream("Tell me a vary short joke")) {
      process.stdout.write(token);
    }
    process.stdout.write("\n");
  } catch (e) {
    console.error("Streaming failed:", e);
  }
}

test();
