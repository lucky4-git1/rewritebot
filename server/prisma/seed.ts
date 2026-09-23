import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo user
  const passwordHash = await argon2.hash('demo123456');

  const user = await prisma.user.upsert({
    where: { email: 'demo@rewritebot.com' },
    update: {},
    create: {
      email: 'demo@rewritebot.com',
      passwordHash,
      name: 'Demo User',
    },
  });

  console.log('✓ Created demo user:', user.email);

  // Create user preferences
  await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      defaultMode: 'standard',
      defaultLanguage: 'en',
      defaultSynonymLevel: 2,
      autoSave: true,
      theme: 'light',
    },
  });

  console.log('✓ Created user preferences');

  // Create a sample document
  const document = await prisma.document.create({
    data: {
      userId: user.id,
      title: 'Welcome to RewriteBot',
      content: `Welcome to RewriteBot!

RewriteBot is your AI writing workspace where you bring your own AI provider. 

Get started by:
1. Connecting an AI provider (Settings → AI Providers)
2. Pasting or typing text in the input editor
3. Selecting a mode (Standard, Fluency, Humanize, etc.)
4. Clicking "Paraphrase"

Your text will be rewritten while preserving the original meaning.`,
      isFavorite: false,
      isArchived: false,
    },
  });

  console.log('✓ Created sample document:', document.title);

  console.log('✨ Seeding completed!');
  console.log('\nDemo credentials:');
  console.log('  Email: demo@rewritebot.com');
  console.log('  Password: demo123456');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
