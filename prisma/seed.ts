import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial transcriptions into database...');

  const sampleTranscriptions = [
    {
      text: 'Meeting ko kal subah 10 baje schedule kar do, client is ready with the requirement documents.',
      language: 'Hinglish',
      duration_s: 5.4,
    },
    {
      text: 'नमस्ते, वॉइसस्क्राइब में आपका स्वागत है। यह देवनागरी लिपि में सटीक रियल-टाइम ट्रांसक्रिप्शन सेवा है।',
      language: 'Hindi',
      duration_s: 6.8,
    },
    {
      text: 'The new microservice architecture has been successfully deployed to the production cluster.',
      language: 'English',
      duration_s: 4.2,
    },
    {
      text: 'नमस्कार, आजचे काम वेळेत पूर्ण झाले आहे आणि अहवाल टीमला पाठवला आहे.',
      language: 'Marathi',
      duration_s: 5.1,
    },
    {
      text: 'வணக்கம், புதிய மென்பொருள் திட்டம் வெற்றிகரமாக தொடங்கப்பட்டது.',
      language: 'Tamil',
      duration_s: 4.9,
    },
    {
      text: 'নমস্কার, আজ আমাদের প্রজেক্ট রিভিউ মিটিং খুব ভালো হয়েছে।',
      language: 'Bengali',
      duration_s: 5.0,
    },
  ];

  for (const item of sampleTranscriptions) {
    await prisma.transcription.create({
      data: item,
    });
  }

  console.log(`Successfully seeded ${sampleTranscriptions.length} transcriptions!`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
