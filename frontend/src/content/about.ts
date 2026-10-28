export interface AboutPillar {
  title: string;
  text: string;
}

const MISSION =
  "Menyediakan solusi keamanan siber terbaik yang melindungi organisasi dari ancaman digital, memastikan kelangsungan bisnis, dan membangun kepercayaan stakeholder.";

export const about = {
  eyebrow: "TENTANG KAMI",
  statement: MISSION,
  pillars: [
    { title: "Misi Kami", text: MISSION },
    {
      title: "Visi Kami",
      text: "Menjadi mitra keamanan siber terpercaya di Indonesia yang dikenal karena keahlian teknis, integritas, dan komitmen terhadap keunggulan dalam perlindungan digital.",
    },
    {
      title: "Pendekatan Kami",
      text: "Kami menggabungkan keahlian teknis mendalam dengan pemahaman bisnis untuk memberikan solusi keamanan yang praktis, terukur, dan sesuai dengan kebutuhan spesifik klien.",
    },
  ],
} as const satisfies { eyebrow: string; statement: string; pillars: readonly AboutPillar[] };
