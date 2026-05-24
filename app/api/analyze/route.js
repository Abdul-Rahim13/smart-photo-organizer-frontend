import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smart-photo-backend-production.up.railway.app/api';
const API_KEY = process.env.API_KEY;

async function analyzeImage(imageBuffer) {
  try {
    // 1. Indoor/Outdoor Detection
    const indoorOutdoor = await axios.post(
      'https://api-inference.huggingface.co/models/prithivMLmods/IndoorOutdoorNet',
      imageBuffer,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    
    let environment = 'Indoor';
    if (indoorOutdoor.data?.[0]) {
      const indoor = indoorOutdoor.data[0].find(p => p.label === 'indoor')?.score || 0;
      const outdoor = indoorOutdoor.data[0].find(p => p.label === 'outdoor')?.score || 0;
      environment = outdoor > indoor ? 'Outdoor' : 'Indoor';
    }

    // 2. Scene Classification
    const scene = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/resnet-50',
      imageBuffer,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    
    let sceneCategory = 'General';
    const keywords = {
      'Party': ['party', 'celebration', 'birthday', 'concert'],
      'Event': ['wedding', 'conference', 'meeting', 'ceremony'],
      'Trip': ['beach', 'mountain', 'nature', 'travel', 'vacation']
    };
    
    if (scene.data?.[0]?.labels) {
      for (const label of scene.data[0].labels) {
        const l = label.toLowerCase();
        for (const [cat, words] of Object.entries(keywords)) {
          if (words.some(w => l.includes(w))) {
            sceneCategory = cat;
            break;
          }
        }
        if (sceneCategory !== 'General') break;
      }
    }

    // 3. Face Detection
    const faces = await axios.post(
      'https://api-inference.huggingface.co/models/arnabdhar/YOLOv8-Face-Detection',
      imageBuffer,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    
    let faceCount = 0;
    let socialGroup = 'Empty';
    if (faces.data && Array.isArray(faces.data)) {
      faceCount = faces.data.filter(f => f.label === 'face' || f.label === 'person').length;
      if (faceCount === 1) socialGroup = 'Solo';
      else if (faceCount === 2) socialGroup = 'Couple';
      else if (faceCount >= 3) socialGroup = 'Group';
    }

    return { sceneCategory, environment, socialGroup, faceCount };
    
  } catch (error) {
    console.error('AI Analysis error:', error.message);
    return { sceneCategory: 'General', environment: 'Indoor', socialGroup: 'Solo', faceCount: 1 };
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('file') || formData.get('photos');
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization') || '';
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Run AI analysis
    const analysis = await analyzeImage(buffer);
    
    // Prepare for backend
    const backendForm = new FormData();
    backendForm.append('photos', imageFile);
    backendForm.append('sceneCategory', analysis.sceneCategory);
    backendForm.append('environment', analysis.environment);
    backendForm.append('socialGroup', analysis.socialGroup);
    backendForm.append('faceCount', analysis.faceCount.toString());
    backendForm.append('qualityScore', '85');
    
    // Send to backend
    const response = await axios.post(`${BASE_URL}/photos/upload`, backendForm, {
      headers: { Authorization: authHeader, 'Content-Type': 'multipart/form-data' }
    });
    
    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}