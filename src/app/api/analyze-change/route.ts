import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { estimateTaskCost, getMarketBenchmark } from '@/lib/rate-engine';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

const changeResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    verdict: { type: SchemaType.STRING, enum: ['in-scope', 'out-of-scope'], format: 'enum' as const },
    reasoning: { type: SchemaType.STRING },
    timelineImpact: { type: SchemaType.STRING },
    suggestedReply: { type: SchemaType.STRING },
    lockedItemReference: { type: SchemaType.STRING, nullable: true }
  },
  required: ['verdict', 'reasoning', 'timelineImpact', 'suggestedReply']
};

export async function POST(req: NextRequest) {
  try {
    const { requestText, scope, settings, clientName, clientEmail } = await req.json();

    if (!requestText || !scope || !settings) {
      return NextResponse.json({ error: 'requestText, scope, and settings are required' }, { status: 400 });
    }

    if (scope.status !== 'locked') {
      return NextResponse.json({ error: 'Change requests can only be submitted for locked scopes.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: changeResponseSchema,
      }
    });

    const prompt = `
You are an expert project manager and scope analyst.
A client has submitted a change request for a locked contract.

Original Scope Items:
${JSON.stringify(scope.items, null, 2)}

Client Request:
"${requestText}"

Analyze the request and determine:
1. Is it 'in-scope' or 'out-of-scope'?
2. Why? (reasoning)
3. What is the estimated timeline impact? (e.g. "+2 days", "None")
4. Write a professional, polite reply template for the freelancer to send to the client. The tone should be firm but friendly, setting clear boundaries.
5. If it's in-scope, provide the exact text of the locked item that includes this (lockedItemReference). Otherwise null.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const aiVerdict = JSON.parse(responseText);
    
    let costData = null;
    let benchmarkData = null;

    if (aiVerdict.verdict === 'out-of-scope') {
      costData = estimateTaskCost(requestText, settings);
      benchmarkData = getMarketBenchmark(settings.skillCategory, settings.experienceLevel, settings.region, settings.currency);
    } else {
      costData = { low: 0, median: 0, high: 0, hours: { low: 0, median: 0, high: 0 }, reasoning: 'In scope, no additional cost.' };
    }

    const finalAnalysis = {
      ...aiVerdict,
      estimatedCostLow: costData.low,
      estimatedCostMedian: costData.median,
      estimatedCostHigh: costData.high,
      estimatedHours: costData.hours,
      marketBenchmark: benchmarkData ? {
        low: benchmarkData.marketLow,
        median: benchmarkData.marketMedian,
        high: benchmarkData.marketHigh
      } : undefined
    };

    return NextResponse.json({ analysis: finalAnalysis });
  } catch (error) {
    console.error('Error in analyze-change:', error);
    return NextResponse.json({ error: 'Failed to analyze change request.' }, { status: 500 });
  }
}
