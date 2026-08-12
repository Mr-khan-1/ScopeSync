import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { AIScopeSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';

const scopeResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING, enum: ['in-scope', 'out-of-scope', 'assumption'], format: 'enum' as const }
        },
        required: ['text', 'category']
      }
    },
    timeline: { type: SchemaType.STRING, nullable: true },
    revisionPolicy: { type: SchemaType.STRING, nullable: true }
  },
  required: ['title', 'items']
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { text, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'Add your free Gemini API key in Settings to use AI features.' }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: scopeResponseSchema,
      }
    });

    const prompt = `
You are a project scope analyst. Extract a structured scope from the 
following client-freelancer communication. Identify what is explicitly 
included, what is explicitly excluded, and what assumptions must hold.

Rules:
- If mentioned as a deliverable → in-scope
- If mentioned as "not included", "future phase", "separate" → out-of-scope
- If implied but not stated → assumption
- Be conservative: when in doubt, mark as out-of-scope to protect the freelancer
- Format as clean bullet points, not legal language

Text to analyze:
${text}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Validate with Zod before sending to client
    const parsed = AIScopeSchema.parse(JSON.parse(responseText));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error in extract-scope:', error);
    return NextResponse.json({ error: 'Failed to extract scope. Gemini may be overloaded. Try again in 30 seconds.' }, { status: 500 });
  }
}
