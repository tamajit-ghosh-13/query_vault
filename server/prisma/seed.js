const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      id: 'arance-fette',
      jarMainTitle: 'ARANCE a fette',
      slug: 'arance-fette',
      variety: 'Blonde Oranges',
      origin: 'Sicily, Italy',
      price240g: 8.5,
      price380g: null,
      price580g: null,
      inStock: true,
      category: 'jams',
    },
    {
      id: 'caponata',
      jarMainTitle: 'Sinfonia Barocca',
      slug: 'caponata',
      variety: 'Eggplant, Peppers, Capers',
      origin: 'Sicily, Italy',
      price240g: 9.5,
      price380g: null,
      price580g: null,
      inStock: true,
      category: 'savory',
    },
    {
      id: 'pesto-rosso',
      jarMainTitle: 'Pesto Rosso',
      slug: 'pesto-rosso',
      variety: 'Sun-dried Tomatoes',
      origin: 'Sicily, Italy',
      price240g: 9.0,
      price380g: null,
      price580g: null,
      inStock: true,
      category: 'savory',
    },
    {
      id: 'fragole-bacche',
      jarMainTitle: 'FRAGOLE e Bacche Goji',
      slug: 'fragole-bacche',
      variety: 'Strawberry & Goji',
      origin: 'Sicily, Italy',
      price240g: 9.5,
      price380g: null,
      price580g: null,
      inStock: true,
      category: 'jams',
    },
    {
      id: 'smeralda',
      jarMainTitle: 'SMERALDA',
      slug: 'smeralda',
      variety: 'Sicilian Pistachio',
      origin: 'Sicily, Italy',
      price240g: 12.5,
      price380g: null,
      price580g: null,
      inStock: true,
      category: 'spreads',
    },
    {
      id: 'gelsi-neri',
      jarMainTitle: 'GELSI NERI',
      slug: 'gelsi-neri',
      variety: 'Black Mulberry',
      origin: 'Sicily, Italy',
      price240g: 9.0,
      price380g: null,
      price580g: null,
      inStock: true,
      category: 'jams',
    },
    {
      id: 'cipolla-agrodolce',
      jarMainTitle: 'Cipolla in Agrodolce',
      slug: 'cipolla-agrodolce',
      variety: 'Sicilian Onion',
      origin: 'Sicily, Italy',
      price240g: 8.0,
      price380g: null,
      price580g: null,
      inStock: true,
      category: 'savory',
    },
    {
      id: 'pere-cannella',
      jarMainTitle: 'PERE e Cannella',
      slug: 'pere-cannella',
      variety: 'Pear & Cinnamon',
      origin: 'Sicily, Italy',
      price240g: 8.5,
      price380g: null,
      price580g: null,
      inStock: true,
      category: 'jams',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
    console.log(`Upserted product: ${product.id}`);
  }

  console.log('✅ Seed complete: 8 Agrumea products loaded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
