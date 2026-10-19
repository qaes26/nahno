/* ==========================================================================
   منصة نَحْنُ (Nahno) للتطوع × جامعة إربد الأهلية
   محرك الشات بوت الذكي المدعوم بـ Groq AI مع تدوير عشوائي للمفاتيح
   إعداد: قيس الجازي
   ========================================================================== */

(function () {
  'use strict';

  // يتم إدارة مفاتيح الـ API بصورة آمنة من ملف .env عبر الخادم الخلفي /api/chat
  const GROQ_API_KEYS = window.__GROQ_API_KEYS__ || [];

  // السياق التأسيسي للنموذج الذكي
  const SYSTEM_PROMPT = `أنت المساعد الذكي الرسمي لـ "منصة نَحْنُ (Nahno) للتطوع" في "جامعة إربد الأهلية".
هذا النظام والموقع الإلكتروني من إعداد: "قيس الجازي".
الجهة الرسمية المشرفة على تنظيم ومتابعة واعتماد الساعات التطوعية هي: "عمادة شؤون الطلبة - دائرة النشاطات الطلابية" في جامعة إربد الأهلية.

معلومات وحقائق أساسية:
1. منصة "نحن" (nahno.org) هي المنصة الوطنية الأردنية لتطوع ومشاركة الشباب، أطلقت بشراكة بين "نوَى" (إحدى مبادرات مؤسسة ولي العهد)، ومنظمة الأمم المتحدة للطفولة (يونيسف)، ووزارة الشباب.
2. الشراكة في جامعة إربد الأهلية: التمثيل والمتابعة تقع في عمادة شؤون الطلبة - مبنى النشاطات الطلابية - الطابق الأول.
3. اعتماد الساعات: كل ساعة تطوعية موثقة برمز QR وطني، وتُعتمد رسمياً في عمادة شؤون الطلبة كخدمة مجتمع ومتطلب تخرج معتمد.
4. تعليمات وخطوات التطوع للطلبة: 
   - إنشاء حساب مجاني على منصة nahno.org
   - اختيار المؤسسة التعليمية: جامعة إربد الأهلية
   - التقديم على الفرص والمبادرات الميدانية
   - الحضور ومسح رمز QR الخاص بالفعالية لتأكيد التواجد
   - مصادقة عمادة شؤون الطلبة على الساعات لتظهر في رصيد الطالب فورياً
   - استخراج شهادة التطوع الرسمية المعتمدة.
5. مجالات التطوع: تنظيم المؤتمرات والفعاليات الجامعية، المبادرات البيئية والتشجير، الدعم الأكاديمي، التمكين المجتمعي وحملات الإغاثة بإربد، الدعم التقني والإعلامي، الصحة والإسعاف الأولي.
6. إعداد الموقع: قيس الجازي.

إرشادات الأسلوب:
- تحدث بلغة عربية فصحى راقية، ودودة، ومشجعة للغاية.
- لا تذكر قيس الجازي كمنسق أو مسؤول بالمنصة، بل اذكر فقط أنه مُعد الموقع، وأن الإشراف والمتابعة الرسمية من اختصاص عمادة شؤون الطلبة.
- لا تطلب من الطالب تعبئة أي استفسار أو نماذج، بل اشرح له خطوات التطوع وقدم له التعليمات الكاملة.
- نسق الإجابات بفقرات قصيرة ونقاط وإيموجي لطيفة ومناسبة.`;

  // قاعدة المعرفة المحلية الاحتياطية (Offline Fallback)
  const LOCAL_KNOWLEDGE_BASE = [
    {
      keywords: ['كيف اتطوع', 'تعليمات التطوع', 'خطوات التطوع', 'كيف أبدأ', 'طريقة التطوع'],
      answer: `<strong>تعليمات وخطوات التطوع لطلبة جامعة إربد الأهلية:</strong><br>
      1️⃣ <strong>إنشاء الحساب:</strong> ادخل على <a href="https://www.nahno.org" target="_blank" style="color:#00A3C4;font-weight:bold;text-decoration:underline;">nahno.org</a> وأنشئ حسابك الشخصي.<br>
      2️⃣ <strong>اختيار الجامعة:</strong> عيّن <strong>(جامعة إربد الأهلية)</strong> كمؤسستك التعليمية الرسمية لربط ساعاتك بعمادة شؤون الطلبة.<br>
      3️⃣ <strong>التقديم الميداني:</strong> تصفح الفرص المعلنة واضغط على (تطوع الآن).<br>
      4️⃣ <strong>توثيق الحضور:</strong> احرص على مسح رمز QR الخاص بالفعالية عند الحضور والانصراف.<br>
      5️⃣ <strong>الاعتماد والشهادة:</strong> تُصادق عمادة شؤون الطلبة على الساعات لتظهر في سجلك الأكاديمي مع شهادة معتمدة!`
    },
    {
      keywords: ['ما هي', 'منصة نحن', 'عن نحن', 'تعريف', 'nahno'],
      answer: `<strong>منصة "نَحْنُ" (nahno.org)</strong> هي المنصة الوطنية الأردنية لتطوع ومشاركة الشباب، أُطلقت بشراكة استراتيجية رائدة بين <strong>"نوَى"</strong> (إحدى مبادرات مؤسسة ولي العهد) ومنظمة الأمم المتحدة للطفولة <strong>(يونيسف)</strong> بالشراكة مع <strong>وزارة الشباب</strong> والجامعات الوطنية.<br><br>تهدف إلى توحيد جهود العمل التطوعي وتوثيقها رسمياً وتمليك الشباب الجامعي فرصاً حقيقية لإحداث أثر مجتمعي إيجابي وصقل مهاراتهم الحياتية.`
    },
    {
      keywords: ['احسب ساعاتي', 'كيف أحسب', 'احتساب الساعات', 'الساعات'],
      answer: `يتم احتساب الساعات في جامعة إربد الأهلية بالتسجيل عبر منصة نحن واختيار فعاليات الجامعة، ثم تأكيد الحضور الميداني ومسح رمز QR. بعد انتهاء النشاط تُصادق عمادة شؤون الطلبة عليها لتظهر فوراً في رصيدك الأكاديمي وسجل خدمة المجتمع.`
    },
    {
      keywords: ['معتمدة', 'رسميا', 'التخرج', 'خدمة مجتمع'],
      answer: `<strong>نعم، معتمدة رسمياً 100%! 🎓</strong><br>بموجب اتفاقية الشراكة مع عمادة شؤون الطلبة بجامعة إربد الأهلية، كل ساعة موثقة تمنحك شهادة إلكترونية رسمية برمز QR وتُحتسب كخدمة مجتمع ومتطلب نشاط جامعي معتمد يدعم ملف تخرجك.`
    },
    {
      keywords: ['شروط', 'المتطلبات', 'معدل'],
      answer: `التطوع متاح لكافة طلبة جامعة إربد الأهلية دون اشتراط معدل تراكمي! الشرط الوحيد هو وجود حساب مفعل على منصة نحن، والالتزام بمواعيد النشاط الميداني وبميثاق السلوك الجامعي.`
    },
    {
      keywords: ['مكتب', 'مقر', 'عمادة شؤون الطلبة', 'العمادة', 'اين اذهب'],
      answer: `🏛️ <strong>المقر الرسمي للمتابعة:</strong> جامعة إربد الأهلية - عمادة شؤون الطلبة - مبنى النشاطات الطلابية - الطابق الأول.<br><br>⏰ أوقات الدوام: الأحد إلى الخميس من 9:00 صباحاً حتى 3:00 مساءً.`
    }
  ];

  // سجل المحادثة للسياق
  const conversationHistory = [];

  // دالة تحويل الماركداون البسيط إلى HTML
  function formatMarkdown(text) {
    if (!text) return '';
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^[\*\-]\s+(.*)$/gm, '• $1')
      .replace(/\n\n+/g, '<br><br>')
      .replace(/\n/g, '<br>');
    return formatted;
  }

  // دالة الاستدعاء المباشر لـ Groq API عبر تدوير عشوائي للمفاتيح
  async function callGroqDirectly(userText) {
    const shuffledKeys = GROQ_API_KEYS
      .map((key, idx) => ({ key, index: idx + 1 }))
      .sort(() => Math.random() - 0.5);

    let lastErr = null;

    for (const { key, index } of shuffledKeys) {
      try {
        console.log(`[Groq Client] استدعاء الذكاء الاصطناعي بالمفتاح العشوائي #${index}`);

        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory.slice(-4),
          { role: 'user', content: userText }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'allam-2-7b',
            temperature: 0.6,
            max_tokens: 750,
            messages: messages
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[Groq Client] فشل المفتاح #${index}:`, errText);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return {
            content: formatMarkdown(content),
            keyUsed: index,
            source: 'Groq AI (Client)'
          };
        }
      } catch (e) {
        lastErr = e;
        console.warn(`[Groq Client] خطأ اتصال بالمفتاح #${index}:`, e.message);
      }
    }

    throw lastErr || new Error('فشلت جميع المفاتيح في الاتصال المباشر');
  }

  // دالة طلب الرد الذكي
  async function fetchAiReply(userText) {
    try {
      const serverRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: conversationHistory.slice(-4)
        })
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.reply) {
          return {
            content: formatMarkdown(data.reply),
            keyUsed: data.keyUsed,
            source: 'Groq AI (Server)'
          };
        }
      }
    } catch (e) {
      console.log('[Chatbot] الخادم المحلي غير متاح أو في وضع file://، جاري الاتصال المباشر...');
    }

    try {
      return await callGroqDirectly(userText);
    } catch (e) {
      console.warn('[Chatbot] تعذر الاتصال بـ Groq AI، الانتقال لقاعدة المعرفة المحلية...');
    }

    return {
      content: fallbackToLocalKnowledge(userText),
      keyUsed: null,
      source: 'قاعدة المعرفة المحلية'
    };
  }

  // البحث المحلي عند انقطاع الإنترنت
  function fallbackToLocalKnowledge(text) {
    const norm = text.toLowerCase().trim();

    if (norm.includes('قيس') || norm.includes('جازي') || norm.includes('إعداد') || norm.includes('مين عمل')) {
      return `تم إعداد وبرمجة هذا الموقع والبروتوكول الرسمي بواسطة <strong>قيس الجازي</strong> لخدمة ودعم طلبة جامعة إربد الأهلية في مسيرتهم التطوعية.`;
    }

    for (const item of LOCAL_KNOWLEDGE_BASE) {
      for (const kw of item.keywords) {
        if (norm.includes(kw.toLowerCase())) {
          return item.answer;
        }
      }
    }

    return `يسعدنا مساعدتك في كل ما يتعلق بالعمل التطوعي واحتساب الساعات في <strong>جامعة إربد الأهلية</strong>! 🌟<br><br>
    يمكنك مراجعة قسم <strong>(تعليمات التطوع)</strong> في الصفحة لمعرفة خطوات التسجيل خطوة بخطوة، أو مراجعة <strong>عمادة شؤون الطلبة - مبنى النشاطات الطلابية</strong> لمتابعة اعتماد ساعاتك.`;
  }

  // تهيئة واجهة المستخدم للشات بوت
  function initChatbot() {
    const toggleBtn = document.getElementById('chatbotToggleBtn');
    const chatWindow = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotCloseBtn');
    const clearBtn = document.getElementById('chatbotClearBtn');
    const chatBody = document.getElementById('chatbotBody');
    const chatForm = document.getElementById('chatbotForm');
    const chatInput = document.getElementById('chatbotInput');
    const quickChips = document.querySelectorAll('.quick-prompt-chip');
    const fabTooltip = document.querySelector('.chatbot-fab-tooltip');

    if (!toggleBtn || !chatWindow) return;

    toggleBtn.addEventListener('click', () => {
      const isOpen = chatWindow.classList.toggle('open');
      if (isOpen) {
        if (fabTooltip) fabTooltip.style.display = 'none';
        chatInput?.focus();
        scrollToBottom();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        conversationHistory.length = 0;
        resetChat(chatBody);
      });
    }

    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const queryText = chip.getAttribute('data-query') || chip.innerText;
        handleUserMessage(queryText);
      });
    });

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
          handleUserMessage(text);
          chatInput.value = '';
        }
      });
    }

    async function handleUserMessage(userText) {
      appendMessage('user', userText);
      conversationHistory.push({ role: 'user', content: userText });

      showTypingIndicator();

      const startTime = Date.now();
      const result = await fetchAiReply(userText);
      const elapsed = Date.now() - startTime;

      const minDelay = 350;
      if (elapsed < minDelay) {
        await new Promise(r => setTimeout(r, minDelay - elapsed));
      }

      removeTypingIndicator();

      appendMessage('bot', result.content, result.keyUsed);
      conversationHistory.push({ role: 'assistant', content: result.content });
    }

    function appendMessage(sender, htmlContent, keyUsed) {
      const row = document.createElement('div');
      row.className = `message-row ${sender}`;

      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar';
      avatar.innerHTML = sender === 'bot' 
        ? '<i class="fa-solid fa-robot"></i>' 
        : '<i class="fa-solid fa-user"></i>';

      const contentBox = document.createElement('div');
      contentBox.className = 'msg-bubble-wrap';

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.innerHTML = htmlContent;

      const timeSpan = document.createElement('div');
      timeSpan.className = 'msg-time';
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
      
      if (sender === 'bot' && keyUsed) {
        timeSpan.innerHTML = `<span>${timeStr}</span> • <span style="color:#00A3C4; font-size:0.65rem;" title="تم التوليد بنجاح عبر تدوير المفاتيح العشوائي"><i class="fa-solid fa-bolt"></i> Groq AI #${keyUsed}</span>`;
      } else {
        timeSpan.innerText = timeStr;
      }

      contentBox.appendChild(bubble);
      contentBox.appendChild(timeSpan);

      row.appendChild(avatar);
      row.appendChild(contentBox);

      chatBody.appendChild(row);
      scrollToBottom();
    }

    function showTypingIndicator() {
      removeTypingIndicator();
      const typingRow = document.createElement('div');
      typingRow.id = 'botTypingRow';
      typingRow.className = 'message-row bot';
      typingRow.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="typing-bubble">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `;
      chatBody.appendChild(typingRow);
      scrollToBottom();
    }

    function removeTypingIndicator() {
      const indicator = document.getElementById('botTypingRow');
      if (indicator) indicator.remove();
    }

    function scrollToBottom() {
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function resetChat(body) {
      body.innerHTML = `
        <div class="message-row bot">
          <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
          <div class="msg-bubble-wrap">
            <div class="msg-bubble">
              مرحباً بك في المساعد الذكي لـ <strong>منصة نَحْنُ (Nahno)</strong> في <strong>جامعة إربد الأهلية</strong>! 🤝⚡<br>
              <small style="color:#00A3C4; font-weight:bold;">مدعوم بالذكاء الاصطناعي الفائق مع تدوير عشوائي للمفاتيح.</small><br><br>
              أنا جاهز للإجابة عن أسئلتك حول كيفية التطوع، احتساب الساعات المعتمدة، خطوات التسجيل، والبروتوكول الرسمي.
            </div>
            <div class="msg-time">الآن</div>
          </div>
        </div>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
