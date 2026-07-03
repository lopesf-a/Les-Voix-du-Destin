import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const player = await prisma.user.upsert({
    where: { email: 'player@example.com' },
    update: {},
    create: {
      email: 'player@example.com',
      pseudo: 'Aventurier',
      passwordHash,
      role: Role.PLAYER
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      pseudo: 'MJ Admin',
      passwordHash,
      role: Role.ADMIN
    }
  });

  const character = await prisma.character.upsert({
    where: { id: 'demo-character' },
    update: {},
    create: {
      id: 'demo-character',
      userId: player.id,
      name: 'Kaël le Veilleur',
      className: 'Guerrier',
      level: 1,
      hp: 20,
      maxHp: 20,
      xp: 0,
      stats: { force: 12, dexterite: 9, intelligence: 8 },
      inventory: ['Épée courte', 'Potion de soin', 'Torche'],
      backstory: 'Un aventurier débutant attiré par les rumeurs de magie ancienne.'
    }
  });

  const scenario = await prisma.scenario.upsert({
    where: { id: 'scenario-varellis' },
    update: {},
    create: {
      id: 'scenario-varellis',
      title: 'Les Ombres de Varellis',
      summary: 'Une cité portuaire est troublée par des disparitions et des murmures venus des égouts.',
      universe: 'Fantasy sombre',
      difficulty: 'Débutant',
      prompt: 'Tu es le maître du jeu. Ambiance fantasy sombre, mystère progressif, choix clairs. Ne révèle pas tout immédiatement.'
    }
  });

  const session = await prisma.gameSession.upsert({
    where: { id: 'demo-session' },
    update: {},
    create: {
      id: 'demo-session',
      userId: player.id,
      characterId: character.id,
      scenarioId: scenario.id,
      title: 'Première nuit à Varellis'
    }
  });

  const countMessages = await prisma.gameMessage.count({ where: { sessionId: session.id } });
  if (countMessages === 0) {
    await prisma.gameMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: 'SYSTEM',
          content: 'Session de démonstration initialisée.'
        },
        {
          sessionId: session.id,
          role: 'MJ',
          content: 'La pluie frappe les pavés de Varellis. Au loin, la taverne du Crabe Noir laisse filtrer une lumière chaude.'
        }
      ]
    });
  }

  await prisma.rule.createMany({
    data: [
      {
        title: 'Test de caractéristique',
        category: 'Système',
        content: 'Le backend lance 1d20, ajoute le modificateur de statistique, compare à une difficulté et applique les conséquences.'
      },
      {
        title: 'Cohérence narrative',
        category: 'IA',
        content: 'L’IA raconte la scène mais ne modifie pas les PV, ne relance pas les dés et respecte le résultat calculé par le backend.'
      },
      {
        title: 'Garde-fou MVP',
        category: 'Sécurité',
        content: 'Les prompts système encadrent les réponses et évitent les sorties hors rôle.'
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed terminé.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
