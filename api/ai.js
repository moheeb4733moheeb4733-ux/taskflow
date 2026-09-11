import { GoogleGenerativeAI } from '@google/generative-ai';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());

function setCors(res, origin) {
  const allow = allowedOrigins.includes('*') ? '*' : (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
}

function clean(value, max = 12000) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

export default async function handler(req, res) {
  setCors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'AI backend is not configured yet' });
  }

  try {
    const body = req.body || {};
    const question = clean(body.question, 4000).trim();
    const context = clean(JSON.stringify(body.context || {}), 30000);
    const excelSummary = clean(JSON.stringify(body.excelSummary || {}), 30000);

    if (!question) return res.status(400).json({ error: 'question is required' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      // Stable, cost-effective model suitable for TaskFlow's operational AI.
      model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
    });

    const prompt = `أنت مساعد إدارة عمليات اسمه TaskFlow AI.
أجب بالعربية الواضحة وبشكل عملي ومباشر. لا تخترع أرقاماً غير موجودة في البيانات.
حلل المهام، التأخير، أداء الموظفين، المخاطر، وبيانات Excel إن وجدت.
إذا كانت البيانات غير كافية فاذكر ذلك بوضوح.

سؤال المستخدم:
${question}

بيانات TaskFlow الحالية:
${context}

ملخص Excel:
${excelSummary}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return res.status(200).json({ ok: true, answer: text });
  } catch (error) {
    console.error('TaskFlow AI error:', error);
    const status = Number(error?.status) || 500;
    const message = String(error?.message || 'AI request failed')
      .replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]')
      .slice(0, 1000);
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: 'AI request failed',
      details: message
    });
  }
}
