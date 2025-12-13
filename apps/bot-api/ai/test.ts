import { generateEmbedding, generateText } from "./index";

async function runTests() {
  console.log("🧪 Running AI function tests...\n");

  // Test 1: generateEmbedding
  console.log("📊 Test 1: generateEmbedding");
  try {
    const embedding = await generateEmbedding("Hello, world!");
    console.log("✅ generateEmbedding succeeded!");
    console.log(`   Embedding length: ${embedding?.length}`);
    console.log(`   First 5 values: [${embedding?.slice(0, 5).join(", ")}...]`);
  } catch (error) {
    console.log("❌ generateEmbedding failed:");
    console.error(`   ${error}`);
  }

  console.log("\n---\n");

  // Test 2: generateText
  console.log("💬 Test 2: generateText");
  try {
    const text = await generateText("Write a one sentence greeting.");
    console.log("✅ generateText succeeded!");
    console.log(`   Generated text: "${text}"`);
  } catch (error) {
    console.log("❌ generateText failed:");
    console.error(`   ${error}`);
  }

  console.log("\n🏁 Tests complete!");
}

runTests();
