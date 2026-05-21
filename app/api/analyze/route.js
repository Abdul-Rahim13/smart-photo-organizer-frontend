import { NextResponse } from 'next/server';

// Helper function to safely parse and forward Hugging Face responses
async function queryHFModel(modelId, token, binaryBuffer) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
    headers: { Authorization: `Bearer ${token}` },
    method: "POST",
    body: binaryBuffer,
  });

  const responseData = await response.json();

  if (!response.ok) {
    // If the model is loading, Hugging Face returns an object containing an "estimated_time" parameter
    if (responseData.error && responseData.estimated_time) {
      console.log(`Model ${modelId} is sleeping. Waiting ${responseData.estimated_time}s to retry...`);
      // Wait for the model to wake up
      await new Promise((resolve) => setTimeout(resolve, responseData.estimated_time * 1000));
      return queryHFModel(modelId, token, binaryBuffer); // Recursive retry
    }

    throw new Error(responseData.error || responseData.message || `HF status ${response.status}`);
  }

  return responseData;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // CRITICAL: Double check these three lines are your real target configurations!
    const HF_ENV_MODEL    = "username/your-environment-model"; 
    const HF_PEOPLE_MODEL = "username/your-people-density-model";
    const HF_API_TOKEN    = "hf_YOUR_ACTUAL_HUGGINGFACE_ACCESS_TOKEN"; 

    if (HF_ENV_MODEL.includes("username") || HF_API_TOKEN.includes("YOUR_ACTUAL")) {
       return NextResponse.json({ error: "Please update route.js with your real model IDs and HF API token values." }, { status: 400 });
    }

    // 1. Query Environment Model with retry framework
    console.log("Analyzing environment status via HF...");
    const envData = await queryHFModel(HF_ENV_MODEL, HF_API_TOKEN, buffer);

    // 2. Query Population Model with retry framework
    console.log("Analyzing crowd structure via HF...");
    const peopleData = await queryHFModel(HF_PEOPLE_MODEL, HF_API_TOKEN, buffer);

    return NextResponse.json({ envData, peopleData });

  } catch (error) {
    console.error("❌ Next.js proxy route caught error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}