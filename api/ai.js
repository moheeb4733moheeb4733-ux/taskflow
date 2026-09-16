import { GoogleGenerativeAI } from '@google/generative-ai';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());

function setCors(res, origin) {
  const allow = allowedOrigins.includes('*') ? '*' : (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
}

function clean(value, max = 30000) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectReportTemplate(question) {
  const q = normalize(question);
  const markers = [
    'تقرير احترافي',
    'تقرير متكامل',
    'هيكل التقرير',
    'معلومات التقرير',
    'منهجية العمل',
    'الملخص التنفيذي',
    'المخرج النهائي',
    'متطلبات الجودة'
  ];
  return markers.some(marker => q.includes(normalize(marker)));
}

function detectPlaceholders(question) {
  const q = normalize(question);
  return q.includes('[اكتب') || q.includes('[الهدف') || q.includes('[الجهة') || q.includes('[الفتره') || q.includes('[الفترة') || q.includes('[النطاق') || q.includes('[اللغه') || q.includes('[اللغة');
}

function buildReportMode(question) {
  if (!detectReportTemplate(question)) return 'هذه ليست بالضرورة رسالة قالب تقرير. نفذ الطلب الفعلي كما يفهم من السياق.';
  if (detectPlaceholders(question)) return 'هذه رسالة قالب تقرير وتحتوي حقولاً غير معبأة. لا تعكس القالب للمستخدم. استخرج الموضوع والنطاق من اسم الملف والأعمدة والبيانات قدر الإمكان، ثم نفذ التقرير مباشرة.';
  return 'هذه رسالة قالب تقرير. لا تعكس القالب للمستخدم. نفذ التقرير الفعلي اعتماداً على البيانات والسياق.';
}

export default async function handler(req, res) {
  setCors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI backend is not configured yet' });

  try {
    const body = req.body || {};
    const question = clean(body.question, 12000).trim();
    const context = clean(JSON.stringify(body.context || {}), 30000);
    const excelSummary = clean(JSON.stringify(body.excelSummary || {}), 30000);
    const excelQueryAnalysis = clean(JSON.stringify(body.excelQueryAnalysis || {}), 60000);
    const excelColumns = clean(JSON.stringify(body.excelColumns || []), 12000);
    const excelFileName = clean(body.excelFileName || '', 500);

    if (!question) return res.status(400).json({ error: 'question is required' });

    const reportMode = buildReportMode(question);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `أنت TaskFlow AI، وكيل محترف لإدارة العمليات وتحليل البيانات وإعداد التقارير التنفيذية.

قاعدة التشغيل الأساسية:
افصل دائماً بين تعليمات المستخدم حول طريقة العمل وبين المهمة الفعلية المطلوب تنفيذها.
أي نص من نوع: أنت خبير، منهجية العمل، متطلبات الجودة، هيكل التقرير، اللغة، طريقة العرض = تعليمات تنفيذ، وليس سؤالاً يجب نسخه أو شرحه.

قواعد صارمة:
1. لا تعيد كتابة البرومبت الأصلي ولا تعرضه في الإجابة.
2. لا تحول تعليمات المستخدم إلى سؤال أو تطلب منه إعادة إرسالها.
3. افحص البيانات المتاحة قبل الحكم على نقص المعلومات.
4. لا تطلب معلومات اختيارية مثل اسم الجهة أو مستوى التفصيل إذا كان بالإمكان إنتاج تقرير مهني بدونها.
5. إذا كان موضوع التقرير واضحاً من اسم الملف أو الأعمدة أو محتوى البيانات، استخدمه مباشرة.
6. إذا كان الموضوع غير واضح فعلاً ولكن يمكن إنتاج تقرير أولي، اختر وصفاً محايداً مستنداً إلى البيانات واذكر أنه وصف مبدئي.
7. لا توقف التحليل بسبب placeholders غير معبأة إذا كان الملف والبيانات يسمحان بالعمل.
8. إذا كانت معلومة واحدة فقط تمنع تنفيذ المطلوب فعلاً، اسأل سؤالاً واحداً محدداً فقط.
9. لا تقل إن البيانات غير كافية قبل فحص الأعمدة والصفوف والتحليل الديناميكي.
10. ميّز بوضوح بين الحقائق والأرقام الفعلية، والتحليل، والاستنتاج، والافتراض، والقيود.
11. لا تخترع أرقاماً أو أهدافاً أو مصادر أو نتائج.
12. عند توفر excelQueryAnalysis استخدمه كمرجع عددي أول لأنه محسوب من الصفوف الأصلية بناءً على سؤال المستخدم.
13. إذا طلب المستخدم التحليل لكل مندوب أو حسب مندوب أو حسب أي عمود، اعرض جميع المجموعات التي حسبها التحليل الديناميكي، وليس أول مجموعة فقط.
14. إذا طلب المستخدم أعلى أو أقل أو أكثر أو ترتيباً، استخدم النتائج المحسوبة ورتبها بوضوح.
15. إذا كان المطلوب تقريراً، أخرج التقرير نفسه، وليس شرحاً لطريقة إعداده.
16. استخدم الجداول عندما تساعد على قراءة النتائج.
17. لا تنشئ أقساماً فارغة. إذا كان قسم غير قابل للتطبيق، اذكر ذلك باختصار ضمن القيود.
18. اجعل التوصيات مرتبطة مباشرة بنتائج البيانات، ولا تدّع وجود KPI رسمي غير موجود في البيانات.

حالة الرسالة:
${reportMode}

المهمة/تعليمات المستخدم الأصلية:
${question}

اسم ملف Excel:
${excelFileName || 'لا يوجد'}

أعمدة Excel:
${excelColumns || 'لا توجد'}

التحليل الديناميكي المحسوب من الصفوف الأصلية:
${excelQueryAnalysis || 'لا توجد نتيجة ديناميكية'}

ملخص Excel العام:
${excelSummary || 'لا يوجد ملخص'}

بيانات TaskFlow الحالية:
${context || 'لا توجد بيانات نظام إضافية'}

نفذ المهمة الآن. لا تعكس القالب أو البرومبت للمستخدم. إذا أمكن تنفيذ التقرير اعتماداً على البيانات، ابدأ مباشرة. وإذا كان هناك نقص حقيقي يمنع التنفيذ، اطرح سؤالاً واحداً محدداً فقط.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text || !text.trim()) return res.status(502).json({ error: 'AI returned an empty response' });
    return res.status(200).json({ ok: true, answer: text });
  } catch (error) {
    console.error('TaskFlow AI error:', error);
    const status = Number(error?.status) || 500;
    const message = String(error?.message || 'AI request failed')
      .replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]')
      .slice(0, 1000);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: 'AI request failed', details: message });
  }
}
