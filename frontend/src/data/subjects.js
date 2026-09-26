export const SUBJECTS = [
  { id: 'matematika', name: 'Matematika', color: 'blue', icon: 'calculator' },
  { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', color: 'green', icon: 'book' },
  { id: 'bahasa-inggris', name: 'Bahasa Inggris', color: 'purple', icon: 'globe' },
  { id: 'ipa', name: 'IPA', color: 'orange', icon: 'flask' },
]

export const DEFAULT_SUBJECT = 'matematika'

const STORAGE_KEY = 'adaptedu_subject'

export const QUESTIONS = {
  matematika: [
    {
      id: 1,
      question: 'Hasil dari 1/2 + 1/3 adalah ...',
      options: ['2/5', '5/6', '3/5', '1/6'],
      answer: 1,
    },
    {
      id: 2,
      question: 'Sederhanakan pecahan 6/8 menjadi ...',
      options: ['3/4', '2/3', '4/6', '1/2'],
      answer: 0,
    },
    {
      id: 3,
      question: 'Nilai dari 3/4 x 20 adalah ...',
      options: ['10', '12', '15', '16'],
      answer: 2,
    },
    {
      id: 4,
      question: 'Manakah pecahan yang lebih besar: 2/3 atau 3/5?',
      options: ['2/3', '3/5', 'Keduanya sama besar', 'Tidak bisa dibandingkan'],
      answer: 0,
    },
    {
      id: 5,
      question: 'Bentuk pecahan dari 0,75 yang telah disederhanakan adalah ...',
      options: ['3/5', '3/4', '4/5', '2/3'],
      answer: 1,
    },
  ],
  'bahasa-indonesia': [
    {
      id: 1,
      question:
        'Apa ide pokok paragraf: "Sari berangkat sekolah naik sepeda setiap pagi. Jarak rumahnya dekat, sehingga ia selalu tiba tepat waktu."?',
      options: [
        'Sari berangkat ke sekolah tepat waktu',
        'Sari suka bersepeda',
        'Sekolah Sari sangat jauh',
        'Sepeda Sari baru dibeli',
      ],
      answer: 0,
    },
    {
      id: 2,
      question: 'Kalimat utama yang berisi gagasan inti sebuah paragraf disebut ...',
      options: ['gagasan pendukung', 'ide pokok', 'simpulan', 'judul'],
      answer: 1,
    },
    {
      id: 3,
      question: 'Sinonim kata "cerdas" adalah ...',
      options: ['lemah', 'pandai', 'lambat', 'sederhana'],
      answer: 1,
    },
    {
      id: 4,
      question: 'Sinonim kata "indah" adalah ...',
      options: ['jelek', 'gelap', 'elok', 'sepi'],
      answer: 2,
    },
    {
      id: 5,
      question:
        'Pak Budi menanam sayur di halaman rumah. Setiap sore ia menyiram tanaman itu. Apa yang dilakukan Pak Budi setiap sore?',
      options: [
        'menanam sayur',
        'menyiram tanaman',
        'membajak sawah',
        'membeli sayur',
      ],
      answer: 1,
    },
  ],
  'bahasa-inggris': [
    {
      id: 1,
      question: 'What is the synonym of the word "happy"?',
      options: ['sad', 'glad', 'angry', 'tired'],
      answer: 1,
    },
    {
      id: 2,
      question: 'The word "guru" in English is ...',
      options: ['doctor', 'teacher', 'student', 'farmer'],
      answer: 1,
    },
    {
      id: 3,
      question: 'She ____ to school every day.',
      options: ['go', 'goes', 'going', 'gone'],
      answer: 1,
    },
    {
      id: 4,
      question: '____ they play football on Monday?',
      options: ['Do', 'Does', 'Is', 'Are'],
      answer: 0,
    },
    {
      id: 5,
      question:
        'Rina wakes up at 5 a.m. She exercises for thirty minutes, then takes a bath. What does Rina do after exercising?',
      options: ['She wakes up', 'She takes a bath', 'She goes to school', 'She sleeps'],
      answer: 1,
    },
  ],
  ipa: [
    {
      id: 1,
      question: 'Berikut yang termasuk makhluk hidup adalah ...',
      options: ['batu', 'kayu', 'tumbuhan', 'air'],
      answer: 2,
    },
    {
      id: 2,
      question: 'Organ tempat tumbuhan melakukan fotosintesis adalah ...',
      options: ['akar', 'daun', 'bunga', 'buah'],
      answer: 1,
    },
    {
      id: 3,
      question: 'Sumber energi panas yang berasal dari alam adalah ...',
      options: ['komputer', 'matahari', 'kulkas', 'kipas'],
      answer: 1,
    },
    {
      id: 4,
      question: 'Alat yang mengubah energi listrik menjadi energi cahaya adalah ...',
      options: ['kipas', 'lilin', 'lampu', 'setrika'],
      answer: 2,
    },
    {
      id: 5,
      question: 'Ketika kita mendorong meja, gaya yang bekerja adalah ...',
      options: ['gaya tarik', 'gaya dorong', 'gaya magnet', 'gaya pegas'],
      answer: 1,
    },
  ],
}

export function isValidSubject(id) {
  return typeof id === 'string' && QUESTIONS[id] !== undefined
}

export function subjectName(id) {
  return SUBJECTS.find((subject) => subject.id === id)?.name ?? ''
}

export function getStoredSubject() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isValidSubject(stored) ? stored : DEFAULT_SUBJECT
  } catch {
    return DEFAULT_SUBJECT
  }
}

export function storeSubject(id) {
  if (!isValidSubject(id)) return
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // storage penuh/di-block tidak menghalangi alur tes
  }
}
