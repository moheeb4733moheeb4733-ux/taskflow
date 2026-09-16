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
function normalize(v) { return String(v ?? '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ًٌٍَُِّْـ]/g, '').replace(/\s+/g, ' ').trim(); }
function hasReportTemplate(question) {
  const q = normalize(question);
  return /تقرير احترافي|تقرير متكامل|هيكل التقرير|معلومات التقرير|منهجية العمل|الملخص التنفيذي|المخرج النهائي|متطلبات الجودة|[اكتب].{0,20}(موضوع التقرير|الهدف|الجهة|الفترة)/.test(q);
}
function hasEmptyPlaceholders(question) {
  return /\[[^\]]*(اكتب|ان وجد|مختصر|متوسط|متعمق)[^\]]*\]/i.test(question);
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

    const reportTemplate = hasReportTemplate(question);
    const placeholders = hasEmptyPlaceholders(question);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `أنت TaskFlow AI، وكيل محترف لإدارة العمليات وتحليل البيانات وإعداد التقارير التنفيذية.

أهم قاعدة تشغيلية:
رسالة المستخدم قد تحتوي على "تعليمات/قالب عمل" بالإضافة إلى "طلب فعلي". افصل بينهما.
تعليمات مثل: أنت خبير، منهجية العمل، متطلبات الجودة، هيكل التقرير، اللغة، طريقة عرض النتائج = قواعد يجب تنفيذها، وليست سؤالاً يجب إعادة شرحه.

قواعد صارمة:
1. لا تعيد كتابة رسالة المستخدم أو تلخص البرومبت الطويل لمجرد أنه طويل.
2. لا تضع البرومبت الأصلي داخل الإجابة.
3. لا تطلب من المستخدم إعادة كتابة معلومات موجودة في اسم الملف أو الأعمدة أو البيانات.
4. افحص البيانات المتاحة أولاً، ثم قرر ما إذا كانت هناك معلومة أساسية مفقودة فعلاً.
5. لا توقف العمل بسبب معلومة اختيارية مثل اسم الجهة أو مستوى التفصيل. استخدم افتراضاً مهنياً معقولاً واذكره باختصار.
6. إذا كان الطلب قالب تقرير يحتوي على placeholders مثل [اكتب موضوع التقرير هنا] وكان هناك ملف بيانات، استنتج موضوعاً مبدئياً من اسم الملف ومحتوى الأعمدة والنتائج، ثم نفذ التحليل والتقرير بدلاً من إغراق المستخدم بالأسئلة.
7. إذا تعذر استنتاج موضوع التقرير بدرجة معقولة، اسأل سؤالاً واحداً مباشراً عن الموضوع، ولا تسأل عن كل الحقول دفعة واحدة.
8. إذا كانت البيانات تسمح بتحليل جزئي أو تقرير أولي، نفذه فوراً، واذكر القيود في قسم مستقل.
9. لا تقل "البيانات غير كافية" إلا بعد التحقق من الأعمدة والصفوف والنتائج المطلوبة.
10. ميّز داخل التقرير بين: البيانات/الحقائق، التحليل، الاستنتاج، الافتراض، والقيود.
11. لا تخترع أرقاماً أو مصادر أو أهدافاً أو أسماء أو نتائج غير موجودة.
12. عند توفر excelQueryAnalysis فهي الحسابات الديناميكية الخاصة بسؤال المستخدم من الصفوف الأصلية، وهي المرجع العددي الأول للسؤال. لا تستبدلها بملخص عام.
13. إذا طلب المستخدم "لكل مندوب" أو "حسب مندوب" أو حسب أي عمود، اعرض جميع المجموعات المتاحة في البيانات التي تم حسابها، وليس أول مجموعة فقط.
14. إذا كانت النتيجة الرقمية أو التجميعية موجودة في excelQueryAnalysis، لا تقل إن التفصيل غير متاح.
15. إذا كان المطلوب تقريراً، أنتج التقرير الفعلي. لا تشرح للمستخدم كيف يمكنه إعداد التقرير.
16. استخدم الجداول عندما تكون مفيدة، ونسق الأرقام بوضوح.
17. لا تنشئ أقساماً فارغة لمجرد أن القالب يحتوي عليها؛ إذا كان قسم غير قابل للتطبيق، اذكر "غير متاح في البيانات الحالية" باختصار.
18. التوصيات يجب أن ترتبط بنتائج فعلية، وتكون قابلة للتنفيذ والقياس. لا تخترع KPI مستهدفاً؛ يمكنك اقتراح مؤشر قياس دون ادعاء وجود هدف رسمي.

سلوك خاص بقالب التقرير:
${reportTemplate ? `هذه الرسالة تبدو كقالب/تعليمات لإعداد تقرير. ${placeholders ? 'توجد حقول Placeholder غير معبأة.' : 'لا توجد placeholders واضحة.'} لا تعكس القالب للمستخدم. استخدم بيانات الملف لاستخراج الموضوع والنطاق قدر الإمكان. إذا أمكن إعداد تقرير مفيد، ابدأ مباشرة.` : 'هذه الرسالة ليست بالضرورة قالب تقرير؛ نفذ الطلب الفعلي كما يفهم من السياق.'}

سؤال/تعليمات المستخدم الأصلية:
${question}

اسم ملف Excel:
${excelFileName || 'لا يوجد'}

أعمدة Excel:
${excelColumns || 'لا توجد'}

نتيجة التحليل الديناميكي من الصفوف الأصلية:
${excelQueryAnalysis || 'لا توجد نتيجة ديناميكية'}

ملخص Excel العام:
${excelSummary || 'لا يوجد ملخص'}

بيانات TaskFlow الحالية:
${context || 'لا توجد بيانات نظام إضافية'}

نفذ الآن المهمة. إذا كان هذا قالب تقرير والموضوع غير مكتوب صراحة، استنتج موضوعاً مناسباً من البيانات قبل طرح أي سؤال. وإذا اضطررت للسؤال، اجعله سؤالاً واحداً فقط ومحدداً.`;

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
