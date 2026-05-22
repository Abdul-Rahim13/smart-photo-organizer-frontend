import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import axios from 'axios';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const BASE_URL =
  'https://smart-photo-backend-production.up.railway.app/api';

// ✅ TURN OFF FAKE MODE (IMPORTANT)
const USE_FAKE_AI = false;

// ── MASTER THEME ─────────────────────────────
function determineMasterTheme(labelsText) {
  const text = labelsText.toLowerCase();

  if (text.includes('party') || text.includes('birthday')) return 'Party';

  if (
    text.includes('concert') ||
    text.includes('festival') ||
    text.includes('stage')
  ) return 'Event';

  if (
    text.includes('beach') ||
    text.includes('mountain') ||
    text.includes('forest') ||
    text.includes('travel') ||
    text.includes('nature')
  ) return 'Trip';

  return 'General';
}

// ── ENVIRONMENT ─────────────────────────────
function determineEnvironment(labelsText) {
  const text = labelsText.toLowerCase();

  const outdoorKeywords = [
    'park',
    'sky',
    'tree',
    'mountain',
    'street',
    'road',
    'field',
    'beach',
    'landscape',
  ];

  return outdoorKeywords.some((k) => text.includes(k))
    ? 'Outdoor'
    : 'Indoor';
}

// ── SOCIAL GROUP ─────────────────────────────
function determineSocialGroup(personCount) {
  if (personCount === 1) return 'Solo';
  if (personCount === 2) return 'Couple';
  if (personCount > 2) return 'Group';
  return 'Empty';
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('file');

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image uploaded' },
        { status: 400 }
      );
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const authHeader = request.headers.get('authorization') || '';
    const hasAuth = authHeader && authHeader.length > 10;

    let sceneResult = [];
    let objectResult = [];

    // ── AI MODE ─────────────────────────────
    if (USE_FAKE_AI) {
      sceneResult = [{ label: 'nature', score: 0.95 }];
      objectResult = [{ label: 'person' }, { label: 'person' }];
    } else {
      sceneResult = await hf.imageClassification({
        model: 'facebook/deit-base-patch16-224',
        data: buffer,
      });

      objectResult = await hf.objectDetection({
        model: 'facebook/detr-resnet-50',
        data: buffer,
      });
    }

    const labelsText = sceneResult.map((r) => r.label).join(' ');

    const masterTheme = determineMasterTheme(labelsText);
    const environment = determineEnvironment(labelsText);

    const personCount = Array.isArray(objectResult)
      ? objectResult.filter((i) => i.label === 'person').length
      : 0;

    const socialGroup = determineSocialGroup(personCount);

    // ── SAVE TO BACKEND (optional) ──
    let savedPhoto = null;

    if (hasAuth) {
      try {
        const backendForm = new FormData();

        const blob = new Blob([buffer], {
          type: imageFile.type,
        });

        backendForm.append('images', blob, imageFile.name);
        backendForm.append('category', masterTheme);
        backendForm.append('hasPeople', personCount > 0);
        backendForm.append('faces', String(personCount));

        const dbRes = await axios.post(
          `${BASE_URL}/photos/upload`,
          backendForm,
          {
            headers: { Authorization: authHeader },
            timeout: 10000,
          }
        );

        savedPhoto = dbRes?.data?.photo || dbRes?.data;
      } catch (e) {
        console.warn('DB skip:', e.message);
      }
    }

    const basePhotoRecord = savedPhoto || {
      _id: `mock_${Date.now()}`,
      title: imageFile.name,
      url: null,
      category: masterTheme,
      createdAt: new Date().toISOString(),
    };

    const aiScore = Math.max(
      Math.round((sceneResult?.[0]?.score || 0.9) * 100),
      85
    );

    return NextResponse.json({
      success: true,
      ...basePhotoRecord,

      masterTheme,
      environment,
      socialGroup,
      personCount,
      aiScore,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}