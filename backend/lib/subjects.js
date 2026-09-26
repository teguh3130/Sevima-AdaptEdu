export const SUBJECTS = {
  matematika: {
    label: 'Matematika',
    topic: 'pecahan, persentase, dan operasi hitung',
  },
  'bahasa-indonesia': {
    label: 'Bahasa Indonesia',
    topic: 'ide pokok, sinonim, dan teks pendek',
  },
  'bahasa-inggris': {
    label: 'Bahasa Inggris',
    topic: 'vocabulary, simple present, dan reading singkat',
  },
  ipa: {
    label: 'IPA',
    topic: 'makhluk hidup, energi, dan gaya',
  },
}

export function subjectOf(id) {
  return SUBJECTS[id] ?? SUBJECTS.matematika
}
