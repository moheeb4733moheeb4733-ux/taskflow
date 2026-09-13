import { GoogleGenerativeAI } from '@google/generative-ai';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());
function setCors(res, origin) {
  const allow = allowedOrigins.includes('*') ? '*' : (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
}
function clean(value, max = 30000) { return typeof value === 'string' ? value.slice(0, max) : ''; }

export default async function handler(req, res) {
  setCors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI backend is not configured yet' });
  try {
    const body = req.body || {};
    const question = clean(body.question, 4000).trim();
    const context = clean(JSON.stringify(body.context || {}), 30000);
    const excelSummary = clean(JSON.stringify(body.excelSummary || {}), 30000);
    const excelQueryAnalysis = clean(JSON.stringify(body.excelQueryAnalysis || {}), 60000);
    const excelColumns = clean(JSON.stringify(body.excelColumns || []), 10000);
    const excelFileName = clean(body.excelFileName || '', 500);
    if (!question) return res.status(400).json({ error: 'question is required' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `أنت TaskFlow AI، مساعد إدارة عمليات وتحليل بيانات.
أجب بالعربية الواضحة والمباشرة.

قاعدة مهمة جداً لملفات Excel:
- لا تعتمد على ملخص ثابت إذا وصلتك نتيجة excelQueryAnalysis.
- excelQueryAnalysis هي نتيجة حسابية مولدة مباشرة من الصفوف الأصلية للملف بناءً على سؤال المستخدم.
- استخدم أرقامها كما هي، ولا تعيد اختراع الأرقام.
- إذا طلب المستخدم التحليل حسب عمود معين، اعرض التجميع حسب ذلك العمود.
- إذا طلب المستخدم "لكل مندوب" أو "حسب مندوب" أو أي بُعد آخر، لا تكتفِ بالإجمالي العام.
- إذا كانت النتيجة تحتوي مجموعات متعددة، اعرض جدولاً منظماً يشمل جميع النتائج المتاحة، وليس أول نتيجة فقط.
- إذا طلب المستخدم نسبة أو معدل، استخدم النسب المحسوبة في النتيجة عندما تكون موجودة.
- إذا طلب المستخدم أكثر/أعلى/أقل، رتّب النتائج واذكر الترتيب بوضوح.
- إذا لم يوجد عمود أو لا توجد بيانات كافية فعلاً، اذكر ذلك فقط.
- لا تقل "البيانات غير كافية للتفصيل" عندما تكون excelQueryAnalysis تحتوي على تفصيل حسب العمود المطلوب.

سؤال المستخدم:
${question}

اسم ملف Excel:
${excelFileName}

أعمدة Excel:
${excelColumns}

نتيجة التحليل الديناميكي للسؤال من الصفوف الأصلية:
${excelQueryAnalysis}

ملخص Excel العام:
${excelSummary}

بيانات TaskFlow الحالية:
${context}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text?.trim()) return res.status(502).json({ error: 'AI returned an empty response' });
    return res.status(200).json({ ok: true, answer: text });
  } catch (error) {
    console.error('TaskFlow AI error:', error);
    const status = Number(error?.status) || 500;
    const message = String(error?.message || 'AI request failed').replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]').slice(0, 1000);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: 'AI request failed', details: message });
  }
}
