// Avro-inspired Phonetic Bengali Transliteration & Character Helper

export const BENGALI_VOWELS = [
  'অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ',
];

export const BENGALI_KARS = [
  { char: 'া', label: 'া (আ-কার)' },
  { char: 'ি', label: 'ি (ই-কার)' },
  { char: 'ী', label: 'ী (ঈ-কার)' },
  { char: 'ু', label: 'ু (উ-কার)' },
  { char: 'ূ', label: 'ূ (ঊ-কার)' },
  { char: 'ৃ', label: 'ৃ (ঋ-কার)' },
  { char: 'ে', label: 'ে (এ-কার)' },
  { char: 'ৈ', label: 'ৈ (ঐ-কার)' },
  { char: 'ো', label: 'ো (ও-কার)' },
  { char: 'ৌ', label: 'ৌ (ঔ-কার)' },
];

export const BENGALI_CONSONANTS = [
  'ক', 'খ', 'গ', 'ঘ', 'ঙ',
  'চ', 'ছ', 'জ', 'ঝ', 'ঞ',
  'ট', 'ঠ', 'ড', 'ঢ', 'ণ',
  'ত', 'থ', 'দ', 'ধ', 'ন',
  'প', 'ফ', 'ব', 'ভ', 'ম',
  'য', 'র', 'ল',
  'শ', 'ষ', 'স', 'হ',
  'ড়', 'ঢ়', 'য়',
];

export const BENGALI_SYMBOLS = [
  { char: '্', label: '্ (হসন্ত / Joiner)' },
  { char: 'ৎ', label: 'ৎ (খণ্ড ত)' },
  { char: 'ং', label: 'ং (অনুস্বার)' },
  { char: 'ঃ', label: 'ঃ (বিসর্গ)' },
  { char: 'ঁ', label: 'ঁ (চন্দ্রবিন্দু)' },
  { char: '।', label: '। (দাঁড়ি)' },
  { char: '৳', label: '৳ (টাকা)' },
  { char: '‌', label: 'ZWNJ' },
];

export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const BENGALI_QUICK_PHRASES = [
  'নমস্কার',
  'আসসালামু আলাইকুম',
  'ধন্যবাদ',
  'শুভ সকাল',
  'শুভ রাত্রি',
  'আজকের ভাবনা',
  'জরুরি কাজ',
  'মনে রাখতে হবে',
];

// Curated high-frequency Bengali phonetic dictionary for instant exact matches
const COMMON_WORDS: Record<string, string[]> = {
  ami: ['আমি', 'আমী'],
  amar: ['আমার'],
  amader: ['আমাদের'],
  tumi: ['তুমি'],
  tomar: ['তোমার'],
  tomader: ['তোমাদের'],
  apni: ['আপনি'],
  apnar: ['আপনার'],
  se: ['সে'],
  tar: ['তার'],
  tara: ['তারা'],
  eta: ['এটা'],
  ota: ['ওটা'],
  ei: ['এই'],
  oi: ['ওই'],
  ki: ['কি', 'কী'],
  keno: ['কেন'],
  kothay: ['কোথায়'],
  kobe: ['কবে'],
  kemon: ['কেমন'],
  kivabe: ['কীভাবে', 'কিভাবে'],
  bangla: ['বাংলা'],
  bangladesh: ['বাংলাদেশ'],
  banglay: ['বাংলায়'],
  bengali: ['বেঙ্গলি', 'বাংলা'],
  bhalo: ['ভালো', 'ভাল'],
  valo: ['ভালো', 'ভাল'],
  kharap: ['খারাপ'],
  achho: ['আছো'],
  achi: ['আছি'],
  achhi: ['আছি'],
  ache: ['আছে'],
  chilo: ['ছিল'],
  chilam: ['ছিলাম'],
  hobe: ['হবে'],
  hoy: ['হয়'],
  hoyeche: ['হয়েছে'],
  dhonnobad: ['ধন্যবাদ'],
  donnobad: ['ধন্যবাদ'],
  nomoshkar: ['নমস্কার'],
  shubho: ['শুভ'],
  shuvo: ['শুভ'],
  suvo: ['শুভ'],
  sokal: ['সকাল'],
  shokal: ['সকাল'],
  bikal: ['বিকাল'],
  rat: ['রাত'],
  raat: ['রাত'],
  ratri: ['রাত্রি'],
  din: ['দিন'],
  aj: ['আজ'],
  aaj: ['আজ'],
  ajker: ['আজকের'],
  kal: ['কাল'],
  kaal: ['কাল'],
  somoy: ['সময়'],
  shomoy: ['সময়'],
  mon: ['মন'],
  pran: ['প্রাণ'],
  jibon: ['জীবন'],
  jiban: ['জীবন'],
  prem: ['প্রেম'],
  bhalobasha: ['ভালোবাসা'],
  valobasa: ['ভালোবাসা'],
  valobasha: ['ভালোবাসা'],
  kobita: ['কবিতা'],
  gaan: ['গান'],
  gan: ['গান'],
  golpo: ['গল্প'],
  boi: ['বই'],
  lekha: ['লেখা'],
  pora: ['পড়া'],
  khata: ['খাতা'],
  kolom: ['কলম'],
  kotha: ['কথা'],
  bhasha: ['ভাষা'],
  vasa: ['ভাষা'],
  shobdo: ['শব্দ'],
  sobdo: ['শব্দ'],
  sundor: ['সুন্দর'],
  shundor: ['সুন্দর'],
  akash: ['আকাশ'],
  megh: ['মেঘ'],
  bristi: ['বৃষ্টি'],
  brishti: ['বৃষ্টি'],
  batash: ['বাতাস'],
  batas: ['বাতাস'],
  nodi: ['নদী'],
  sagor: ['সাগর'],
  pahar: ['পাহাড়'],
  ful: ['ফুল'],
  phul: ['ফুল'],
  pakhi: ['পাখি'],
  chad: ['চাঁদ'],
  chand: ['চাঁদ'],
  taraa: ['তারা'],
  surjo: ['সূর্য'],
  shurjo: ['সূর্য'],
  alo: ['আলো'],
  andhar: ['আঁধার'],
  shopno: ['স্বপ্ন'],
  swopno: ['স্বপ্ন'],
  sopno: ['স্বপ্ন'],
  chinta: ['চিন্তা'],
  bhabna: ['ভাবনা'],
  vabna: ['ভাবনা'],
  kaj: ['কাজ'],
  kaaj: ['কাজ'],
  notun: ['নতুন'],
  purono: ['পুরনো', 'পুরোনো'],
  bhabishyot: ['ভবিষ্যৎ'],
  otit: ['অতীত'],
  bortoman: ['বর্তমান'],
  projukti: ['প্রযুক্তি'],
  biggan: ['বিজ্ঞান'],
  kod: ['কোড'],
  code: ['কোড'],
  note: ['নোট'],
  not: ['নোট'],
  sonar: ['সোনার'],
  desh: ['দেশ'],
  des: ['দেশ'],
  prithibi: ['পৃথিবী'],
  manush: ['মানুষ'],
  bondhu: ['বন্ধু'],
  poribar: ['পরিবার'],
  maa: ['মা'],
  baba: ['বাবা'],
  bhai: ['ভাই'],
  bon: ['বোন'],
  ek: ['এক'],
  dui: ['দুই'],
  tin: ['তিন'],
  char: ['চার'],
  pach: ['পাঁচ'],
  choy: ['ছয়'],
  sat: ['সাত'],
  aat: ['আট'],
  noy: ['নয়'],
  dosh: ['দশ'],
  ha: ['হ্যাঁ'],
  hyan: ['হ্যাঁ'],
  na: ['না'],
  ebong: ['এবং'],
  ar: ['আর'],
  aar: ['আর'],
  kintu: ['কিন্তু'],
  tobe: ['তবে'],
  jodi: ['যদি'],
  tahole: ['তাহলে'],
  karon: ['কারণ'],
  jonno: ['জন্য'],
  sathe: ['সাথে'],
  shathe: ['সাথে'],
  theke: ['থেকে'],
  diye: ['দিয়ে'],
  niye: ['নিয়ে'],
  kore: ['করে'],
  kora: ['করা'],
  korbo: ['করব'],
  korchi: ['করছি'],
  korchhi: ['করছি'],
  jabo: ['যাব'],
  jacchi: ['যাচ্ছি'],
  aschi: ['আসছি'],
  dekhbo: ['দেখব'],
  dekha: ['দেখা'],
  shona: ['শোনা'],
  bola: ['বলা'],
  likha: ['লিখা'],
  thaka: ['থাকা'],
  chawa: ['চাওয়া'],
  pawa: ['পাওয়া'],
};

interface PhoneticRule {
  roman: string;
  bengali: string;
  isVowel?: boolean;
  kar?: string;
}

// Longest-match phonetic rules
const PHONETIC_RULES: PhoneticRule[] = [
  // Multi-char vowels & diphthongs
  { roman: 'rri', bengali: 'ঋ', isVowel: true, kar: 'ৃ' },
  { roman: 'OI', bengali: 'ঐ', isVowel: true, kar: 'ৈ' },
  { roman: 'OU', bengali: 'ঔ', isVowel: true, kar: 'ৌ' },
  { roman: 'oi', bengali: 'ঐ', isVowel: true, kar: 'ৈ' },
  { roman: 'ou', bengali: 'ঔ', isVowel: true, kar: 'ৌ' },
  { roman: 'ri', bengali: 'ঋ', isVowel: true, kar: 'ৃ' },
  { roman: 'ee', bengali: 'ঈ', isVowel: true, kar: 'ী' },
  { roman: 'oo', bengali: 'উ', isVowel: true, kar: 'ু' },
  { roman: 'aa', bengali: 'আ', isVowel: true, kar: 'া' },

  // Multi-char consonants & conjunct helpers
  { roman: 'kSh', bengali: 'ক্ষ' },
  { roman: 'ksh', bengali: 'ক্ষ' },
  { roman: 'chh', bengali: 'ছ' },
  { roman: 'Chh', bengali: 'ছ' },
  { roman: 'ngk', bengali: 'ঙ্ক' },
  { roman: 'ngg', bengali: 'ঙ্গ' },
  { roman: 'Ng', bengali: 'ঙ' },
  { roman: 'NG', bengali: 'ঞ' },
  { roman: 'ng', bengali: 'ং' },
  { roman: 'Sh', bengali: 'ষ' },
  { roman: 'sh', bengali: 'শ' },
  { roman: 'ch', bengali: 'চ' },
  { roman: 'kh', bengali: 'খ' },
  { roman: 'gh', bengali: 'ঘ' },
  { roman: 'jh', bengali: 'ঝ' },
  { roman: 'Th', bengali: 'ঠ' },
  { roman: 'Dh', bengali: 'ঢ' },
  { roman: 'th', bengali: 'থ' },
  { roman: 'dh', bengali: 'ধ' },
  { roman: 'ph', bengali: 'ফ' },
  { roman: 'bh', bengali: 'ভ' },
  { roman: 'Rh', bengali: 'ঢ়' },
  { roman: 't``', bengali: 'ৎ' },

  // Single-char vowels
  { roman: 'a', bengali: 'আ', isVowel: true, kar: 'া' },
  { roman: 'A', bengali: 'আ', isVowel: true, kar: 'া' },
  { roman: 'i', bengali: 'ই', isVowel: true, kar: 'ি' },
  { roman: 'I', bengali: 'ঈ', isVowel: true, kar: 'ী' },
  { roman: 'u', bengali: 'উ', isVowel: true, kar: 'ু' },
  { roman: 'U', bengali: 'ঊ', isVowel: true, kar: 'ূ' },
  { roman: 'e', bengali: 'এ', isVowel: true, kar: 'ে' },
  { roman: 'E', bengali: 'এ', isVowel: true, kar: 'ে' },
  { roman: 'o', bengali: 'অ', isVowel: true, kar: '' },
  { roman: 'O', bengali: 'ও', isVowel: true, kar: 'ো' },

  // Single-char consonants
  { roman: 'k', bengali: 'ক' },
  { roman: 'g', bengali: 'গ' },
  { roman: 'c', bengali: 'চ' },
  { roman: 'j', bengali: 'জ' },
  { roman: 'T', bengali: 'ট' },
  { roman: 'D', bengali: 'ড' },
  { roman: 'N', bengali: 'ণ' },
  { roman: 't', bengali: 'ত' },
  { roman: 'd', bengali: 'দ' },
  { roman: 'n', bengali: 'ন' },
  { roman: 'p', bengali: 'প' },
  { roman: 'f', bengali: 'ফ' },
  { roman: 'b', bengali: 'ব' },
  { roman: 'v', bengali: 'ভ' },
  { roman: 'm', bengali: 'ম' },
  { roman: 'z', bengali: 'য' },
  { roman: 'r', bengali: 'র' },
  { roman: 'l', bengali: 'ল' },
  { roman: 'S', bengali: 'শ' },
  { roman: 's', bengali: 'স' },
  { roman: 'h', bengali: 'হ' },
  { roman: 'R', bengali: 'ড়' },
  { roman: 'y', bengali: 'য়' },
  { roman: 'Y', bengali: 'য়' },
  { roman: 'w', bengali: 'ও' },
  { roman: 'q', bengali: 'ক' },
  { roman: 'x', bengali: 'ক্স' },

  // Symbols & punctuation
  { roman: ':', bengali: 'ঃ' },
  { roman: '^', bengali: 'ঁ' },
  { roman: '.', bengali: '।' },

  // Digits
  { roman: '0', bengali: '০' },
  { roman: '1', bengali: '১' },
  { roman: '2', bengali: '২' },
  { roman: '3', bengali: '৩' },
  { roman: '4', bengali: '৪' },
  { roman: '5', bengali: '৫' },
  { roman: '6', bengali: '৬' },
  { roman: '7', bengali: '৭' },
  { roman: '8', bengali: '৮' },
  { roman: '9', bengali: '৯' },
];

export function transliteratePhonetic(input: string): string {
  if (!input) return '';

  let result = '';
  let i = 0;
  let lastWasConsonant = false;

  while (i < input.length) {
    let matched: PhoneticRule | null = null;

    // Find longest matching rule at position i
    for (const rule of PHONETIC_RULES) {
      if (input.startsWith(rule.roman, i)) {
        matched = rule;
        break;
      }
    }

    if (!matched) {
      result += input[i];
      lastWasConsonant = false;
      i += 1;
      continue;
    }

    if (matched.isVowel) {
      if (lastWasConsonant) {
        // Attach vowel kar (or omit for inherent 'o')
        result += matched.kar ?? '';
      } else {
        result += matched.bengali;
      }
      lastWasConsonant = false;
    } else {
      // Special check: don't add hasanta before symbols/digits/anusvara
      const isModifierOrDigit =
        ['ং', 'ঃ', 'ঁ', '।', 'ৎ', '০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'].includes(matched.bengali);

      if (lastWasConsonant && !isModifierOrDigit && matched.roman !== 'y') {
        // Implicit conjunct between adjacent consonants without vowel
        result += '্' + matched.bengali;
      } else if (lastWasConsonant && matched.roman === 'y') {
        // 'y' after consonant becomes য-ফলা (্য)
        result += '্য';
      } else {
        result += matched.bengali;
      }
      lastWasConsonant = !isModifierOrDigit;
    }

    i += matched.roman.length;
  }

  return result;
}

/**
 * Generates up to 4 smart Bengali candidate suggestions for a single Romanized token.
 */
export function getBengaliCandidates(romanWord: string): string[] {
  const trimmed = romanWord.trim();
  if (!trimmed) return [];

  const candidates: string[] = [];
  const lower = trimmed.toLowerCase();

  // 1. Dictionary exact matches first
  if (COMMON_WORDS[lower]) {
    for (const w of COMMON_WORDS[lower]) {
      if (!candidates.includes(w)) candidates.push(w);
    }
  }

  // 2. Primary algorithmic transliteration (case-sensitive for T/D/S/O distinctions)
  const primary = transliteratePhonetic(trimmed);
  if (primary && !candidates.includes(primary)) {
    candidates.push(primary);
  }

  // 3. Variant without conjunct hasanta (useful when user didn't type 'o' between consonants)
  const looseVowelVariant = primary.replace(/্/g, '');
  if (looseVowelVariant && looseVowelVariant !== primary && !candidates.includes(looseVowelVariant)) {
    candidates.push(looseVowelVariant);
  }

  // 4. Variant ending with ো if word ends in consonant + o
  if (lower.endsWith('o') && !lower.endsWith('oo')) {
    const withOkar = transliteratePhonetic(trimmed.slice(0, -1) + 'O');
    if (withOkar && !candidates.includes(withOkar)) {
      candidates.push(withOkar);
    }
  }

  // 5. Keep original English word as last fallback option
  if (!candidates.includes(trimmed)) {
    candidates.push(trimmed);
  }

  return candidates.slice(0, 5);
}
