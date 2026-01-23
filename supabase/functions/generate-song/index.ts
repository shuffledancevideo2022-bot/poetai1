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
const VALID_GENRES = ['pop', 'rock', 'hip-hop', 'electronic', 'indie', 'folk', 'jazz', 'rnb', 'country', 'blues', 'disco', 'synthwave', 'ballad'];
const VALID_MOODS = ['энергичная', 'меланхоличная', 'романтичная', 'веселая', 'драматичная', 'мечтательная', 'мощная', 'спокойная', 'ностальгическая'];
const VALID_STRUCTURES = ['standard', 'extended', 'minimal', 'epic'];
const VALID_LANGUAGES = ['russian', 'english', 'mixed'];
const VALID_LENGTHS = ['short', 'medium', 'long'];
const VALID_ARTIST_STYLES = ['free', 'laskoviy-may', 'komissar', 'mirazh', 'diskoteka-avariya', 'ivanushki', 'ruki-vverh', 'na-na', 'teknologiya', 'kino', 'ddt', 'nautilus', 'alisa', 'splin', 'zemfira', 'bi-2', 'leningrad', 'agata-kristi', 'akvarium', 'chai-f', 'lyube', 'mashina-vremeni', 'sekret', 'mumiy-troll', 'slot'];
const VALID_VOCAL_TYPES = ['male', 'female', 'mixed', 'choir', 'whisper', 'raspy', 'falsetto'];
const VALID_TEMPOS = ['slow', 'medium', 'fast', 'very-fast'];
const VALID_PRODUCTION_STYLES = ['clean', 'lo-fi', 'live', 'retro', 'modern', 'raw'];

// Input validation function
function validateInput(data: unknown): { 
  valid: true; 
  data: { 
    prompt: string; 
    genre: string; 
    mood: string; 
    structure: string; 
    language: string; 
    length: string; 
    artistStyle: string; 
    vocalType: string; 
    tempo: string; 
    productionStyle: string;
  } 
} | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { prompt, genre, mood, structure, language, length, artistStyle, vocalType, tempo, productionStyle } = data as Record<string, unknown>;

  // Validate prompt
  if (typeof prompt !== 'string' || prompt.length === 0) {
    return { valid: false, error: 'Prompt is required' };
  }
  if (prompt.length > 2000) {
    return { valid: false, error: 'Prompt must be less than 2000 characters' };
  }

  // Validate all options against allowlists with defaults
  const validatedGenre = typeof genre === 'string' && VALID_GENRES.includes(genre) ? genre : 'pop';
  const validatedMood = typeof mood === 'string' && VALID_MOODS.includes(mood) ? mood : 'энергичная';
  const validatedStructure = typeof structure === 'string' && VALID_STRUCTURES.includes(structure) ? structure : 'standard';
  const validatedLanguage = typeof language === 'string' && VALID_LANGUAGES.includes(language) ? language : 'russian';
  const validatedLength = typeof length === 'string' && VALID_LENGTHS.includes(length) ? length : 'medium';
  const validatedArtistStyle = typeof artistStyle === 'string' && VALID_ARTIST_STYLES.includes(artistStyle) ? artistStyle : 'free';
  const validatedVocalType = typeof vocalType === 'string' && VALID_VOCAL_TYPES.includes(vocalType) ? vocalType : 'mixed';
  const validatedTempo = typeof tempo === 'string' && VALID_TEMPOS.includes(tempo) ? tempo : 'medium';
  const validatedProductionStyle = typeof productionStyle === 'string' && VALID_PRODUCTION_STYLES.includes(productionStyle) ? productionStyle : 'clean';

  return {
    valid: true,
    data: {
      prompt: prompt.trim().substring(0, 2000),
      genre: validatedGenre,
      mood: validatedMood,
      structure: validatedStructure,
      language: validatedLanguage,
      length: validatedLength,
      artistStyle: validatedArtistStyle,
      vocalType: validatedVocalType,
      tempo: validatedTempo,
      productionStyle: validatedProductionStyle
    }
  };
}

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

    const { prompt, genre, mood, structure, language, length, artistStyle, vocalType, tempo, productionStyle } = validation.data;
    
    // Log sanitized parameters (no raw user input)
    console.log('Generating song with params:', { 
      promptLength: prompt.length, 
      genre, 
      mood, 
      structure, 
      language, 
      length, 
      artistStyle, 
      vocalType, 
      tempo, 
      productionStyle 
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Структуры песни с правильными SUNO тегами
    const structureGuide: Record<string, string> = {
      standard: `
[Intro] → [Verse 1] → [Chorus] → [Verse 2] → [Chorus] → [Bridge] → [Chorus] → [Outro]`,
      extended: `
[Intro] → [Verse 1] → [Pre-Chorus] → [Chorus] → [Verse 2] → [Pre-Chorus] → [Chorus] → [Bridge] → [Final Chorus] → [Outro]`,
      minimal: `
[Intro] → [Verse 1] → [Chorus] → [Verse 2] → [Chorus] → [Outro]`,
      epic: `
[Intro - Atmospheric] → [Verse 1] → [Build] → [Chorus - Powerful] → [Verse 2] → [Chorus] → [Bridge - Emotional] → [Drop] → [Final Chorus - Epic] → [Outro - Fade]`
    };

    // Инструкции по языку
    const languageInstructions: Record<string, string> = {
      russian: 'ВАЖНО: Пиши текст ПОЛНОСТЬЮ на русском языке. Используй красивую русскую рифму (AABB, ABAB или ABBA). Рифмы должны быть точными и звучными.',
      english: 'Write lyrics entirely in English. Use strong rhyme schemes (AABB, ABAB, or ABBA).',
      mixed: 'Смешивай русский и английский. Припев на английском, куплеты на русском. Mix Russian verses with English chorus.'
    };

    // Длина песни
    const lengthInstructions: Record<string, string> = {
      short: 'Короткая песня (1-2 мин): 2 куплета по 4 строки, припев 4 строки, повтор 2 раза.',
      medium: 'Средняя песня (2-3 мин): 2-3 куплета по 4-6 строк, припев 4-6 строк, бридж 4 строки.',
      long: 'Длинная песня (3-4 мин): 3 куплета по 6-8 строк, припев 6 строк, бридж, аутро.'
    };

    // Стили артистов с подробными описаниями
    const artistStyles: Record<string, { name: string; description: string }> = {
      'laskoviy-may': { 
        name: 'Ласковый Май', 
        description: 'Простые наивные тексты о первой любви, синтезаторные аранжировки 80-х, высокий тенор, припевы с "ла-ла-ла", ностальгия по юности'
      },
      'komissar': { 
        name: 'Комиссар', 
        description: 'Энергичные танцевальные треки, eurodance звучание, драматичные тексты о любви, синтезаторы и барабаны 90-х'
      },
      'mirazh': { 
        name: 'Мираж', 
        description: 'Женский вокал, романтичные тексты, диско-поп 80-х, легкие синтезаторные мелодии, мечтательное настроение'
      },
      'diskoteka-avariya': { 
        name: 'Дискотека Авария', 
        description: 'Весёлые танцевальные хиты, юмористические тексты, eurodance, запоминающиеся хуки, клубная энергия 2000-х'
      },
      'ivanushki': { 
        name: 'Иванушки International', 
        description: 'Бойз-бэнд, романтичные баллады и танцевальные хиты, гармоничные вокалы, поп 90-х'
      },
      'ruki-vverh': { 
        name: 'Руки Вверх', 
        description: 'Eurodance, простые запоминающиеся тексты о любви, энергичные биты, клубные хиты 90-х'
      },
      'na-na': { 
        name: 'На-На', 
        description: 'Поп-рок, яркие шоу, энергичные танцевальные треки, броские припевы'
      },
      'teknologiya': { 
        name: 'Технология', 
        description: 'Синти-поп, электронное звучание, холодные синтезаторы, минималистичные тексты'
      },
      'kino': { 
        name: 'Кино', 
        description: 'Пост-панк, глубокие философские тексты, минималистичные аранжировки, меланхоличный вокал Цоя, гитарные риффы'
      },
      'ddt': { 
        name: 'ДДТ', 
        description: 'Русский рок, социальные и философские тексты, мощный хриплый вокал Шевчука, рок-баллады'
      },
      'nautilus': { 
        name: 'Nautilus Pompilius', 
        description: 'Новая волна, поэтичные метафоричные тексты, синтезаторы и гитары, атмосферное звучание'
      },
      'alisa': { 
        name: 'Алиса', 
        description: 'Хард-рок, мощный вокал Кинчева, социальные тексты, агрессивные гитары'
      },
      'splin': { 
        name: 'Сплин', 
        description: 'Альтернативный рок, ироничные интеллектуальные тексты, меланхоличные мелодии'
      },
      'zemfira': { 
        name: 'Земфира', 
        description: 'Альтернативный рок, личные эмоциональные тексты, уникальный женский вокал, атмосферные аранжировки'
      },
      'bi-2': { 
        name: 'Би-2', 
        description: 'Альтернативный рок, кинематографичные тексты, меланхоличные мелодии, рок-баллады'
      },
      'leningrad': { 
        name: 'Ленинград', 
        description: 'Ска-панк, провокационные юмористические тексты, духовые, хриплый вокал Шнурова'
      },
      'agata-kristi': { 
        name: 'Агата Кристи', 
        description: 'Готик-рок, мрачные поэтичные тексты, минорные мелодии, декадентское настроение'
      },
      'akvarium': { 
        name: 'Аквариум', 
        description: 'Арт-рок, философские и мистические тексты БГ, эклектичные аранжировки'
      },
      'chai-f': { 
        name: 'Чайф', 
        description: 'Русский рок, позитивные жизнерадостные тексты, блюзовые риффы'
      },
      'lyube': { 
        name: 'Любэ', 
        description: 'Патриотические тексты, рок-баллады, мужской хор, русская душа'
      },
      'mashina-vremeni': { 
        name: 'Машина Времени', 
        description: 'Классический русский рок, философские тексты Макаревича, мелодичные гитары'
      },
      'sekret': { 
        name: 'Секрет', 
        description: 'Рок-н-ролл, весёлые тексты, ретро-стилистика, энергичные мелодии'
      },
      'mumiy-troll': { 
        name: 'Мумий Тролль', 
        description: 'Брит-поп влияние, игра слов, необычные образы, танцевальные ритмы'
      },
      'slot': { 
        name: 'Слот', 
        description: 'Альтернативный метал, женский вокал, агрессивные риффы, эмоциональные тексты'
      },
    };

    // Типы вокала для SUNO
    const vocalTypes: Record<string, string> = {
      'male': '[Male Vocals], deep male voice, strong male lead',
      'female': '[Female Vocals], sweet female voice, expressive female lead',
      'mixed': '[Duet], male and female vocals, harmonies',
      'choir': '[Choir], group vocals, layered harmonies',
      'whisper': '[Whisper], soft intimate vocals, breathy voice',
      'raspy': '[Raspy Vocals], raw emotional voice, gritty texture',
      'falsetto': '[Falsetto], high ethereal vocals, airy tone'
    };

    // Темпы для SUNO
    const tempos: Record<string, string> = {
      'slow': '70-90 BPM, slow tempo, relaxed pace',
      'medium': '100-120 BPM, moderate tempo, steady groove',
      'fast': '130-150 BPM, fast tempo, high energy',
      'very-fast': '160-180 BPM, very fast, intense energy'
    };

    // Стили продакшена
    const productionStyles: Record<string, string> = {
      'clean': 'clean mix, studio-grade, balanced frequency response, professional mastering',
      'lo-fi': 'lo-fi texture, vinyl crackle, warm analog sound, tape saturation',
      'live': 'live recording feel, room ambience, organic sound',
      'retro': 'vintage production, 80s synths, analog warmth, classic sound',
      'modern': 'modern production, crisp highs, deep bass, polished mix',
      'raw': 'raw unpolished sound, garage recording, authentic feel'
    };

    // Жанры для SUNO с правильными тегами
    const genreStyles: Record<string, string> = {
      'pop': 'Pop, catchy melodies, radio-friendly, hook-driven',
      'rock': 'Rock, electric guitars, powerful drums, energetic',
      'hip-hop': 'Hip-Hop, 808 drums, trap hi-hats, rhythmic flow',
      'electronic': 'Electronic, synthesizers, drum machine, pulsing bass',
      'indie': 'Indie, alternative, lo-fi guitars, intimate vocals',
      'folk': 'Folk, acoustic guitar, natural vocals, traditional melodies',
      'jazz': 'Jazz, smooth piano, walking bass, sophisticated harmonies',
      'rnb': 'R&B, soulful vocals, smooth grooves, emotional delivery',
      'country': 'Country, steel guitar, storytelling lyrics, americana',
      'blues': 'Blues, 12-bar progression, expressive guitar, soulful',
      'disco': 'Disco, funky bass, four-on-the-floor, groovy',
      'synthwave': 'Synthwave, 80s synths, retro-futuristic, neon vibes',
      'ballad': 'Ballad, slow emotional, piano-driven, powerful vocals'
    };

    // Настроения для SUNO
    const moodStyles: Record<string, string> = {
      'энергичная': 'energetic, upbeat, driving, high-energy, euphoric build',
      'меланхоличная': 'melancholic, sad, emotional, bittersweet, minor key',
      'романтичная': 'romantic, tender, loving, warm, intimate',
      'веселая': 'happy, joyful, cheerful, bright, uplifting',
      'драматичная': 'dramatic, cinematic, intense, powerful, orchestral build',
      'мечтательная': 'dreamy, atmospheric, ethereal, floating, soft',
      'мощная': 'powerful, anthemic, stadium, epic, climactic',
      'спокойная': 'calm, peaceful, serene, ambient, relaxed',
      'ностальгическая': 'nostalgic, wistful, reminiscent, vintage, warm'
    };

    // Формируем стиль исполнителя
    let artistStylePrompt = '';
    if (artistStyle !== 'free' && artistStyles[artistStyle]) {
      const artist = artistStyles[artistStyle];
      artistStylePrompt = `

КРИТИЧЕСКИ ВАЖНО - СТИЛЬ АРТИСТА "${artist.name}":
${artist.description}
Копируй характерные черты этого исполнителя: мелодии, текстовые паттерны, эмоциональную подачу.`;
    }

    // Собираем SUNO-оптимизированный стиль
    const sunoStyle = [
      genreStyles[genre] || genre,
      moodStyles[mood] || mood,
      tempos[tempo] || tempos['medium'],
      vocalTypes[vocalType] || vocalTypes['mixed'],
      productionStyles[productionStyle] || productionStyles['clean']
    ].join(', ');

    const systemPrompt = `Ты — профессиональный автор песен, создающий тексты для SUNO AI.

КРИТИЧЕСКИ ВАЖНО - ПРАВИЛА СОЗДАНИЯ КАЧЕСТВЕННОГО ТЕКСТА:

1. РИФМА И РИТМ:
   - Каждая строка должна иметь ТОЧНУЮ рифму (созвучие последних 2-3 слогов)
   - Используй схемы рифмовки: AABB (парная) или ABAB (перекрёстная)
   - Сохраняй одинаковое количество слогов в рифмующихся строках
   - Ударения в конце строк должны совпадать

2. ${languageInstructions[language] || languageInstructions['russian']}

3. СТРУКТУРА ДЛЯ SUNO AI:
${structureGuide[structure] || structureGuide['standard']}

4. ${lengthInstructions[length] || lengthInstructions['medium']}

5. ОБЯЗАТЕЛЬНЫЕ SUNO МЕТА-ТЕГИ (используй их!):
   Структурные: [Intro], [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Post-Chorus], [Bridge], [Outro], [Drop], [Build], [Breakdown], [Fade Out]
   Вокальные: [Male Vocals], [Female Vocals], [Duet], [Choir], [Whisper], [Harmonies], [Spoken Word], [Ad-libs]
   Инструментальные: [Instrumental], [Guitar Solo], [Piano Solo], [Synth Solo], [Bass Drop]
   Динамические: [Building Intensity], [Climactic], [Soft], [Powerful], [Emotional], [Euphoric Build]
   Эффекты: [Reverb Heavy], [Echo], [Distorted], [Clean], [Acoustic]

6. ФОРМАТ ВЫВОДА:
   - Первая строка: стиль для поля "Style of Music" в формате: ${sunoStyle}
   - Затем пустая строка
   - Затем текст песни с мета-тегами

7. КАЧЕСТВО ТЕКСТА:
   - Припев должен быть ЗАПОМИНАЮЩИМСЯ и ПОВТОРЯЕМЫМ (3-4 строки максимум)
   - Куплеты рассказывают историю (4-6 строк)
   - Бридж даёт контраст и эмоциональный пик
   - Добавляй мелодические элементы: "О-о-о", "А-а-а", "На-на-на" где уместно
   - Избегай сложных слов — текст должен легко петься!${artistStylePrompt}

8. АТМОСФЕРА И НАСТРОЕНИЕ: ${moodStyles[mood] || mood}

ПРИМЕР ПРАВИЛЬНОГО ФОРМАТА:

${sunoStyle}

[Intro - Atmospheric]
[Soft synth pad, building anticipation]

[Verse 1 - ${vocalTypes[vocalType]?.split(',')[0] || 'Male Vocals'}]
Строка первая с хорошей рифмой,
Строка вторая — парой идёт красивой,
Строка третья продолжает тему,
Строка четвёртая — без проблемы.

[Pre-Chorus - Building Intensity]
Напряжение нарастает тут,
К припеву все дороги ведут!

[Chorus - Powerful, Catchy Hook]
Запоминающийся припев легко поётся,
Эта мелодия в голове остаётся!
О-о-о, эта песня о любви,
О-о-о, мечты свои зови!

СОЗДАЙ ПЕСНЮ ТОЧНО В ТАКОМ ФОРМАТЕ!`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Создай качественную песню на тему: "${prompt}". Убедись что рифмы точные и текст легко поётся!` }
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
          JSON.stringify({ error: 'Необходимо пополнить баланс Lovable AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    const fullSong = data.choices[0].message.content;
    
    // Извлекаем стиль из первой строки
    const lines = fullSong.split('\n');
    let style = sunoStyle;
    let songStartIndex = 0;
    
    // Ищем первую непустую строку как стиль
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('[')) {
        style = line;
        songStartIndex = i + 1;
        break;
      } else if (line.startsWith('[')) {
        // Если сразу начинается с тега, используем дефолтный стиль
        songStartIndex = i;
        break;
      }
    }
    
    // Пропускаем пустые строки после стиля
    while (songStartIndex < lines.length && !lines[songStartIndex].trim()) {
      songStartIndex++;
    }
    
    const songText = lines.slice(songStartIndex).join('\n').trim();

    return new Response(
      JSON.stringify({ style, song: songText }),
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
    console.error('Error in generate-song function:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: 'Произошла ошибка при генерации песни. Пожалуйста, попробуйте позже.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
