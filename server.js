const http = require('http');
const fs = require('fs');
const path = require('path');

// دالة تحميل وقراءة ملف المتغيرات البيئية .env محلياً بدون مكتبات خارجية
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      }
      console.log('✅ تم تحميل إعدادات ومفاتيح ملف .env بنجاح');
    } catch (e) {
      console.warn('⚠️ تعذر قراءة ملف .env:', e.message);
    }
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = __dirname;
const MODEL_NAME = process.env.GROQ_MODEL || 'allam-2-7b';

// استخراج مفاتيح Groq API من ملف .env مع توفير قيم احتياطية
function getGroqKeys() {
  if (process.env.GROQ_API_KEYS) {
    const keys = process.env.GROQ_API_KEYS.split(',').map(k => k.trim()).filter(Boolean);
    if (keys.length > 0) return keys;
  }
  const individualKeys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3
  ].filter(Boolean);

  if (individualKeys.length > 0) return individualKeys;

  return [];
}

const GROQ_API_KEYS = getGroqKeys();

// السياق والمعرفة التأسيسية للمساعد الذكي
const SYSTEM_PROMPT = `أنت المساعد الذكي الرسمي لـ "منصة نَحْنُ (Nahno) للتطوع" في "جامعة إربد الأهلية".
هذا النظام والموقع الإلكتروني من إعداد: "قيس الجازي".
الجهة الرسمية المشرفة على تنظيم ومتابعة واعتماد التطوع هي: "عمادة شؤون الطلبة - دائرة النشاطات الطلابية" في جامعة إربد الأهلية.

معلومات وحقائق أساسية ملزمة:
1. منصة "نحن" (nahno.org) هي المنصة الوطنية الأردنية لتطوع ومشاركة الشباب، أطلقت بشراكة بين "نوَى" (إحدى مبادرات مؤسسة ولي العهد)، ومنظمة الأمم المتحدة للطفولة (يونيسف)، ووزارة الشباب.
2. الشراكة في جامعة إربد الأهلية: التمثيل والمنسقية الرسمية تقع في عمادة شؤون الطلبة - مبنى النشاطات الطلابية - الطابق الأول.
3. اعتماد الساعات: كل ساعة تطوعية موثقة برمز QR وطني، وتُعتمد رسمياً في عمادة شؤون الطلبة كخدمة مجتمع ومتطلب تخرج معتمد.
4. تعليمات وخطوات التطوع للطلبة: 
   - إنشاء حساب مجاني على منصة nahno.org
   - اختيار المؤسسة التعليمية: جامعة إربد الأهلية
   - التقديم على الفرص والمبادرات الميدانية المعلنة
   - الحضور الميداني ومسح رمز QR الخاص بالفعالية لتأكيد التواجد
   - مصادقة عمادة شؤون الطلبة على الساعات لتظهر في رصيد الطالب خلال 24-48 ساعة
   - تحميل شهادة التطوع الرسمية المعتمدة برمز QR الوطني.
5. الرتب والأوسمة التكريمية:
   - المتطوع المبادر (البرونزي): 20 ساعة
   - المتطوع النشط (الفضي): 50 ساعة
   - المتطوع القيادي (الذهبي): 100 ساعة
   - فارس التطوع الجامعي (الماسي): 150+ ساعة مع درع رئاسة الجامعة.
6. مجالات التطوع المتاحة: تنظيم المؤتمرات والفعاليات الجامعية، المبادرات البيئية والتشجير، الدعم والإرشاد الأكاديمي، التمكين المجتمعي وحملات الإغاثة بإربد، الدعم التقني والإعلامي، الصحة والإسعاف الأولي.
7. إعداد الموقع والنظام: قيس الجازي.

إرشادات الأسلوب:
- تحدث بلغة عربية فصحى راقية، ودودة، ومشجعة للغاية على العمل التطوعي.
- لا تذكر قيس الجازي كمنسق، بل اذكر فقط أنه معد الموقع، وأن الجهة الرسمية للمتابعة هي عمادة شؤون الطلبة.
- لا تطلب من الطالب إرسال أي استفسار عبر نماذج، بل اشرح له تعليمات التطوع ووجهه مباشرة للمنصة أو لمقر عمادة شؤون الطلبة.
- نسق الإجابات بفقرات قصيرة ونقاط وإيموجي لطيفة ومناسبة.`;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// دالة استدعاء Groq API بالتدوير العشوائي والتبديل الاحتياطي
async function callGroqWithRandomKey(messages) {
  const currentKeys = getGroqKeys();
  const shuffledKeys = currentKeys
    .map((key, index) => ({ key, index }))
    .sort(() => Math.random() - 0.5);

  let lastError = null;

  for (const { key, index } of shuffledKeys) {
    try {
      console.log(`[Groq AI] محاولة الاستدعاء بالمفتاح العشوائي رقم #${index + 1}...`);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          temperature: 0.6,
          max_tokens: 800,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Groq AI] فشل المفتاح #${index + 1} بالحالة ${response.status}:`, errorText);
        lastError = new Error(`Groq API error (${response.status}): ${errorText}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (content) {
        console.log(`[Groq AI] تم بنجاح عبر المفتاح #${index + 1}`);
        return {
          content,
          keyIndex: index + 1,
          model: MODEL_NAME
        };
      }
    } catch (err) {
      console.error(`[Groq AI] استثناء في المفتاح #${index + 1}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('فشلت جميع مفاتيح Groq API في الحصول على رد.');
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = decodeURI(req.url.split('?')[0]);

  if (req.method === 'POST' && reqPath === '/api/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const userMessage = parsed.message || '';
        const history = parsed.history || [];

        if (!userMessage) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'الرسالة فارغة' }));
          return;
        }

        const messages = [
          ...history.slice(-4),
          { role: 'user', content: userMessage }
        ];

        const result = await callGroqWithRandomKey(messages);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          reply: result.content,
          keyUsed: result.keyIndex,
          model: result.model
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          error: err.message,
          fallbackNeeded: true
        }));
      }
    });
    return;
  }

  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`=======================================================`);
  console.log(`منصة نَحْنُ (Nahno) للتطوع × جامعة إربد الأهلية`);
  console.log(`الخادم يعمل بنجاح على: http://127.0.0.1:${PORT}`);
  console.log(`تم قراءة ملف .env وتفعيل تدوير المفاتيح (${GROQ_API_KEYS.length} مفاتيح)`);
  console.log(`النموذج النشط: ${MODEL_NAME}`);
  console.log(`إعداد: قيس الجازي`);
  console.log(`=======================================================`);
});
