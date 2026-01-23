import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // max 10 requests per minute per IP

// In-memory rate limit store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

// Check rate limit for an IP
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
}

// Get client IP from request
function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         req.headers.get('cf-connecting-ip') ||
         'unknown';
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Expose-Headers': 'X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After',
};

// Allowlists for valid options
const VALID_STYLES = ['лирика', 'рэп', 'шансон', 'классика', 'баллада', 'хайку', 'юмор', 'философия', 'поздравление', 'романс', 'сонет', 'ода', 'элегия', 'басня', 'эпиграмма', 'частушка', 'рок-текст', 'поп-текст', 'фолк', 'акростих'];
const VALID_MOODS = ['радость', 'грусть', 'ностальгия', 'страсть', 'вдохновение', 'мечтательность', 'меланхолия', 'тревога', 'надежда', 'умиротворение', 'дерзость', 'нежность', 'торжество', 'отчаяние', 'восторг'];
const VALID_THEMES = ['любовь', 'разлука', 'мечты', 'природа', 'судьба', 'воспоминания', 'дружба', 'жизнь', 'одиночество', 'время', 'свобода', 'родина', 'странствия', 'вечность', 'творчество', 'детство', 'семья', 'ночь', 'море', 'город'];
const VALID_POET_STYLES = ['none', 'pushkin', 'lermontov', 'esenin', 'mayakovsky', 'akhmatova', 'tsvetaeva', 'pasternak', 'mandelstam', 'brodsky', 'vysotsky', 'okudzhava', 'akhmadulina', 'evtushenko', 'rozhdestvensky', 'asadov', 'severyanin', 'blok', 'fet', 'tyutchev', 'rubtsov'];
const VALID_ARTIST_STYLES = ['none', 'laskovymay', 'kino', 'nautilus', 'aria', 'alisa', 'ddt', 'mirazh', 'komissar', 'rukivverh', 'ivanushki', 'zemfira', 'splin', 'bi2', 'mumiytroll', 'lyube', 'mashinavremeni', 'agatakristy', 'tehnologiya', 'sekret', 'fabrika'];

// Input validation function
function validateInput(data: unknown): { valid: true; data: { prompt: string; style: string; mood: string; theme: string; quatrainCount: number; poetStyle: string; artistStyle: string } } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { prompt, style, mood, theme, quatrainCount, poetStyle, artistStyle } = data as Record<string, unknown>;

  // Validate prompt
  if (typeof prompt !== 'string' || prompt.length === 0) {
    return { valid: false, error: 'Prompt is required' };
  }
  if (prompt.length > 2000) {
    return { valid: false, error: 'Prompt must be less than 2000 characters' };
  }

  // Validate style
  const validatedStyle = typeof style === 'string' && VALID_STYLES.includes(style.toLowerCase()) 
    ? style.toLowerCase() 
    : 'лирика';

  // Validate mood
  const validatedMood = typeof mood === 'string' && VALID_MOODS.includes(mood.toLowerCase()) 
    ? mood.toLowerCase() 
    : 'вдохновение';

  // Validate theme
  const validatedTheme = typeof theme === 'string' && VALID_THEMES.includes(theme.toLowerCase()) 
    ? theme.toLowerCase() 
    : 'любовь';

  // Validate quatrainCount
  let validatedQuatrainCount = 4;
  if (typeof quatrainCount === 'number') {
    validatedQuatrainCount = Math.max(1, Math.min(10, Math.floor(quatrainCount)));
  } else if (typeof quatrainCount === 'string') {
    const parsed = parseInt(quatrainCount, 10);
    if (!isNaN(parsed)) {
      validatedQuatrainCount = Math.max(1, Math.min(10, parsed));
    }
  }

  // Validate poetStyle
  const validatedPoetStyle = typeof poetStyle === 'string' && VALID_POET_STYLES.includes(poetStyle) 
    ? poetStyle 
    : 'none';

  // Validate artistStyle
  const validatedArtistStyle = typeof artistStyle === 'string' && VALID_ARTIST_STYLES.includes(artistStyle) 
    ? artistStyle 
    : 'none';

  return {
    valid: true,
    data: {
      prompt: prompt.trim().substring(0, 2000),
      style: validatedStyle,
      mood: validatedMood,
      theme: validatedTheme,
      quatrainCount: validatedQuatrainCount,
      poetStyle: validatedPoetStyle,
      artistStyle: validatedArtistStyle
    }
  };
}

// Описания стилей поэтов
const poetStyles: Record<string, string> = {
  pushkin: "Пиши в стиле Александра Пушкина: лёгкость и изящество слога, классический ямб, точные рифмы, гармоничное сочетание возвышенного и разговорного, остроумие и глубина мысли.",
  lermontov: "Пиши в стиле Михаила Лермонтова: романтический пафос, мотивы одиночества и бунтарства, яркие контрасты, страстность и меланхолия, мощные образы.",
  esenin: "Пиши в стиле Сергея Есенина: деревенские образы, нежность к природе, напевность и музыкальность, простые но глубокие метафоры, русская душа и тоска.",
  mayakovsky: "Пиши в стиле Владимира Маяковского: лесенка, рубленый ритм, неологизмы, гиперболы, агитационный пафос, яркие метафоры, разговорная интонация.",
  akhmatova: "Пиши в стиле Анны Ахматовой: лаконизм, точность детали, сдержанная эмоциональность, любовная лирика с трагическим подтекстом, классическая форма.",
  tsvetaeva: "Пиши в стиле Марины Цветаевой: экспрессия и страстность, тире и паузы, ритмическая свобода, неожиданные переносы, мифологические образы.",
  pasternak: "Пиши в стиле Бориса Пастернака: сложные метафоры, философичность, природа как живое существо, неожиданные ассоциации, импрессионистичность.",
  mandelstam: "Пиши в стиле Осипа Мандельштама: культурные аллюзии, архитектурные образы, смысловая многослойность, акмеистическая точность, глубина подтекста.",
  brodsky: "Пиши в стиле Иосифа Бродского: длинные синтаксические конструкции, философские размышления, анжамбеман, ирония и меланхолия, интеллектуальная глубина.",
  vysotsky: "Пиши в стиле Владимира Высоцкого: разговорная речь, надрыв и искренность, острые социальные темы, юмор и трагизм, образы простых людей.",
  okudzhava: "Пиши в стиле Булата Окуджавы: мягкая ирония, арбатские мотивы, интеллигентность, романтика повседневности, тёплая грусть.",
  akhmadulina: "Пиши в стиле Беллы Ахмадулиной: изысканность, необычные метафоры, нежность и хрупкость, любовь к деталям, музыкальность стиха.",
  evtushenko: "Пиши в стиле Евгения Евтушенко: публицистичность, гражданский пафос, исповедальность, эмоциональные контрасты, яркие образы.",
  rozhdestvensky: "Пиши в стиле Роберта Рождественского: лирический пафос, любовная и гражданская тематика, песенность, простота и искренность.",
  asadov: "Пиши в стиле Эдуарда Асадова: доступность, душевность, любовная тематика, оптимизм, мудрые жизненные наблюдения, ясность мысли.",
  severyanin: "Пиши в стиле Игоря Северянина: эстетизм, экзотика, неологизмы, салонность, музыкальность, эпатаж и изысканность.",
  blok: "Пиши в стиле Александра Блока: символизм, мистические образы, тема России и Прекрасной Дамы, музыкальность, туманные метафоры.",
  fet: "Пиши в стиле Афанасия Фета: импрессионизм, природа и чувства, лёгкость, музыкальность, мимолётные впечатления, чистая лирика.",
  tyutchev: "Пиши в стиле Фёдора Тютчева: философская глубина, космические образы, антитезы, связь природы и души, торжественность.",
  rubtsov: "Пиши в стиле Николая Рубцова: тихая лирика, Русский Север, деревенские мотивы, печаль и просветление, простота."
};

// Описания стилей исполнителей
const artistStyles: Record<string, string> = {
  laskovymay: "Пиши в стиле группы 'Ласковый Май': простые подростковые переживания, первая любовь, расставания, белые розы, школьные романы, наивная романтика.",
  kino: "Пиши в стиле группы 'Кино' (Виктор Цой): минимализм, философские образы, экзистенциальные темы, звезда по имени Солнце, перемены, ночь и город.",
  nautilus: "Пиши в стиле 'Наутилус Помпилиус': поэтичность, Илья Кормильцев, метафоричность, философия, скованные одной цепью, крылья.",
  aria: "Пиши в стиле группы 'Ария': эпические сюжеты, героика, мистика, металлические образы, воля и честь, баллады о воинах.",
  alisa: "Пиши в стиле группы 'Алиса' (Константин Кинчев): бунтарство, рок-н-ролл, мистицизм, социальный протест, мы вместе.",
  ddt: "Пиши в стиле группы 'ДДТ' (Юрий Шевчук): социальная лирика, что такое осень, романтика и протест, философские размышления.",
  mirazh: "Пиши в стиле группы 'Мираж': танцевальные тексты, музыка нас связала, ритмичность, лёгкость, дискотечная романтика.",
  komissar: "Пиши в стиле группы 'Комиссар': энергичные тексты, ты уйдёшь, евродиско, эмоциональность, драма расставаний.",
  rukivverh: "Пиши в стиле группы 'Руки Вверх': студент, простые истории любви, юмор, танцевальность, молодёжный сленг.",
  ivanushki: "Пиши в стиле 'Иванушки International': тополиный пух, лёгкая романтика, поп-тексты, летние истории.",
  zemfira: "Пиши в стиле Земфиры: личные переживания, искренность, надрыв, рифмы, необычные образы, современный язык.",
  splin: "Пиши в стиле группы 'Сплин': орбит без сахара, романтик, меланхоличность, городские пейзажи, философия повседневности.",
  bi2: "Пиши в стиле группы 'Би-2': полковнику никто не пишет, кинематографичность, мрачная романтика, серебро.",
  mumiytroll: "Пиши в стиле 'Мумий Тролль': Владивосток 2000, ироничность, морские мотивы, игра слов, необычные метафоры.",
  lyube: "Пиши в стиле группы 'Любэ': патриотизм, конь, деревенские и армейские темы, простота и душевность.",
  mashinavremeni: "Пиши в стиле 'Машины времени' (Андрей Макаревич): поворот, философия, притчевость, мудрость, классический рок.",
  agatakristy: "Пиши в стиле 'Агата Кристи': как на войне, мрачный романтизм, декаданс, сказка, необычные образы.",
  tehnologiya: "Пиши в стиле группы 'Технология': нажми на кнопку, синтипоп-тексты, футуризм, странная любовь.",
  sekret: "Пиши в стиле группы 'Секрет': привет, позитив, ленинградский рок, ироничность, лёгкость.",
  fabrika: "Пиши в стиле группы 'Фабрика': девушки фабричные, поп-тексты, танцевальность, романтика."
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Слишком много запросов. Пожалуйста, подождите.',
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000))
          } 
        }
      );
    }

    // Check request size (limit to 10KB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10240) {
      return new Response(
        JSON.stringify({ error: 'Request too large' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = validateInput(requestBody);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, style, mood, theme, quatrainCount, poetStyle, artistStyle } = validation.data;
    
    // Log sanitized parameters (no raw user input)
    console.log('Generate poem request:', { 
      promptLength: prompt.length, 
      style, 
      mood, 
      theme, 
      quatrainCount, 
      poetStyle, 
      artistStyle 
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Формируем инструкции по стилю поэта
    let poetInstruction = "";
    if (poetStyle !== 'none' && poetStyles[poetStyle]) {
      poetInstruction = `\n\n🎭 СТИЛЬ ПОЭТА:\n${poetStyles[poetStyle]}`;
    }

    // Формируем инструкции по стилю исполнителя
    let artistInstruction = "";
    if (artistStyle !== 'none' && artistStyles[artistStyle]) {
      artistInstruction = `\n\n🎤 СТИЛЬ ИСПОЛНИТЕЛЯ:\n${artistStyles[artistStyle]}`;
    }

    // Создаем системный промт для генерации стихов
    const systemPrompt = `Ты — талантливый поэт и автор песен. Твоя задача — создавать красивые, эмоциональные и выразительные стихотворения на русском языке.

📋 ОСНОВНЫЕ ПАРАМЕТРЫ:
• Стиль: ${style}
• Настроение: ${mood}
• Тема: ${theme}
• Количество четверостиший: ровно ${quatrainCount}
${poetInstruction}${artistInstruction}

📝 ТРЕБОВАНИЯ К СТИХОТВОРЕНИЮ:
1. Строго ${quatrainCount} четверостишия (каждое по 4 строки)
2. Идеальная рифма (ABAB или AABB схема)
3. Ровный ритм и размер (ямб, хорей, дактиль и т.д.)
4. Яркие образы и метафоры
5. Эмоциональная глубина
6. Соответствие заданному настроению и теме

⚠️ ВАЖНО:
- Выдавай ТОЛЬКО текст стихотворения
- Никаких комментариев, объяснений или заголовков
- Каждое четверостишие отделяй пустой строкой`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Превышен лимит запросов. Пожалуйста, попробуйте позже.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Необходимо пополнить баланс для использования AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const poem = data.choices[0].message.content;
    console.log('Generated poem successfully');

    return new Response(
      JSON.stringify({ poem }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000))
        } 
      }
    );
  } catch (error) {
    // Log detailed error server-side only
    console.error('Error in generate-poem function:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: 'Произошла ошибка при генерации стихотворения. Пожалуйста, попробуйте позже.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
