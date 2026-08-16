import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Sample catalog: brands -> models -> accessories.
// Prices are illustrative placeholders in USD; edit freely from the admin panel.
const catalog = [
  {
    name: "Toyota",
    models: [
      {
        name: "Corolla",
        yearFrom: 2014,
        yearTo: 2024,
        accessories: [
          { name: "All-Weather Floor Mats", category: "Interior", buyPrice: 18, sellPrice: 39.99, quantity: 42, storageLocation: "A1-03" },
          { name: "Trunk Cargo Organizer", category: "Interior", buyPrice: 9, sellPrice: 24.99, quantity: 30, storageLocation: "A1-07" },
          { name: "Windshield Sun Shade", category: "Exterior", buyPrice: 5, sellPrice: 14.99, quantity: 60, storageLocation: "B2-01" },
          { name: "LED Headlight Bulbs (Pair)", category: "Lighting", buyPrice: 22, sellPrice: 54.99, quantity: 25, storageLocation: "C1-12" },
        ],
      },
      {
        name: "Camry",
        yearFrom: 2015,
        yearTo: 2024,
        accessories: [
          { name: "All-Weather Floor Mats", category: "Interior", buyPrice: 20, sellPrice: 42.99, quantity: 35, storageLocation: "A1-04" },
          { name: "Chrome Door Handle Covers", category: "Exterior", buyPrice: 12, sellPrice: 29.99, quantity: 18, storageLocation: "B2-05" },
          { name: "Rear Bumper Protector", category: "Exterior", buyPrice: 15, sellPrice: 34.99, quantity: 20, storageLocation: "B2-06" },
        ],
      },
      {
        name: "RAV4",
        yearFrom: 2016,
        yearTo: 2024,
        accessories: [
          { name: "Roof Rack Cross Bars", category: "Exterior", buyPrice: 65, sellPrice: 149.99, quantity: 12, storageLocation: "D3-01" },
          { name: "Cargo Liner", category: "Interior", buyPrice: 25, sellPrice: 59.99, quantity: 22, storageLocation: "A1-09" },
          { name: "Mud Flaps (Set of 4)", category: "Exterior", buyPrice: 18, sellPrice: 44.99, quantity: 27, storageLocation: "B2-08" },
        ],
      },
    ],
  },
  {
    name: "Honda",
    models: [
      {
        name: "Civic",
        yearFrom: 2016,
        yearTo: 2024,
        accessories: [
          { name: "All-Weather Floor Mats", category: "Interior", buyPrice: 18, sellPrice: 39.99, quantity: 38, storageLocation: "A1-05" },
          { name: "Carbon Fiber Spoiler", category: "Exterior", buyPrice: 80, sellPrice: 189.99, quantity: 8, storageLocation: "D3-04" },
          { name: "Interior LED Light Kit", category: "Lighting", buyPrice: 14, sellPrice: 32.99, quantity: 33, storageLocation: "C1-02" },
        ],
      },
      {
        name: "CR-V",
        yearFrom: 2017,
        yearTo: 2024,
        accessories: [
          { name: "Roof Rack Cross Bars", category: "Exterior", buyPrice: 68, sellPrice: 154.99, quantity: 10, storageLocation: "D3-02" },
          { name: "Cargo Liner", category: "Interior", buyPrice: 26, sellPrice: 61.99, quantity: 19, storageLocation: "A1-10" },
          { name: "Rear Bumper Protector", category: "Exterior", buyPrice: 16, sellPrice: 36.99, quantity: 15, storageLocation: "B2-07" },
        ],
      },
    ],
  },
  {
    name: "Ford",
    models: [
      {
        name: "F-150",
        yearFrom: 2015,
        yearTo: 2024,
        accessories: [
          { name: "Bed Liner (Spray-On Kit)", category: "Exterior", buyPrice: 45, sellPrice: 99.99, quantity: 14, storageLocation: "D3-06" },
          { name: "Tonneau Cover", category: "Exterior", buyPrice: 180, sellPrice: 399.99, quantity: 6, storageLocation: "E4-01" },
          { name: "Running Boards", category: "Exterior", buyPrice: 95, sellPrice: 219.99, quantity: 9, storageLocation: "E4-02" },
          { name: "All-Weather Floor Mats", category: "Interior", buyPrice: 24, sellPrice: 49.99, quantity: 20, storageLocation: "A1-06" },
        ],
      },
      {
        name: "Mustang",
        yearFrom: 2015,
        yearTo: 2024,
        accessories: [
          { name: "Carbon Fiber Spoiler", category: "Exterior", buyPrice: 90, sellPrice: 209.99, quantity: 7, storageLocation: "D3-05" },
          { name: "Interior LED Light Kit", category: "Lighting", buyPrice: 14, sellPrice: 32.99, quantity: 24, storageLocation: "C1-03" },
          { name: "Windshield Sun Shade", category: "Exterior", buyPrice: 5, sellPrice: 14.99, quantity: 40, storageLocation: "B2-02" },
        ],
      },
    ],
  },
  {
    name: "BMW",
    models: [
      {
        name: "3 Series",
        yearFrom: 2016,
        yearTo: 2024,
        accessories: [
          { name: "All-Weather Floor Mats", category: "Interior", buyPrice: 35, sellPrice: 79.99, quantity: 16, storageLocation: "A1-11" },
          { name: "Chrome Door Handle Covers", category: "Exterior", buyPrice: 20, sellPrice: 49.99, quantity: 12, storageLocation: "B2-09" },
          { name: "LED Headlight Bulbs (Pair)", category: "Lighting", buyPrice: 30, sellPrice: 69.99, quantity: 18, storageLocation: "C1-13" },
        ],
      },
      {
        name: "X5",
        yearFrom: 2014,
        yearTo: 2024,
        accessories: [
          { name: "Roof Rack Cross Bars", category: "Exterior", buyPrice: 85, sellPrice: 189.99, quantity: 9, storageLocation: "D3-03" },
          { name: "Cargo Liner", category: "Interior", buyPrice: 32, sellPrice: 74.99, quantity: 13, storageLocation: "A1-12" },
        ],
      },
    ],
  },
];

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await prisma.admin.findUnique({ where: { username: adminUsername } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({ data: { username: adminUsername, passwordHash } });
    console.log(`Created admin user "${adminUsername}"`);
  } else {
    console.log(`Admin user "${adminUsername}" already exists, skipping`);
  }

  for (const brandData of catalog) {
    const brandSlug = slugify(brandData.name);
    const brand = await prisma.brand.upsert({
      where: { slug: brandSlug },
      update: {},
      create: { name: brandData.name, slug: brandSlug },
    });

    for (const modelData of brandData.models) {
      const modelSlug = slugify(modelData.name);
      const model = await prisma.model.upsert({
        where: { brandId_slug: { brandId: brand.id, slug: modelSlug } },
        update: {},
        create: {
          name: modelData.name,
          slug: modelSlug,
          yearFrom: modelData.yearFrom,
          yearTo: modelData.yearTo,
          brandId: brand.id,
        },
      });

      for (const acc of modelData.accessories) {
        const sku = `${brandSlug}-${modelSlug}-${slugify(acc.name)}`.slice(0, 60);
        const existing = await prisma.accessory.findUnique({ where: { sku } });
        if (!existing) {
          await prisma.accessory.create({
            data: {
              sku,
              name: acc.name,
              category: acc.category,
              buyPrice: acc.buyPrice,
              sellPrice: acc.sellPrice,
              quantity: acc.quantity,
              storageLocation: acc.storageLocation,
              modelId: model.id,
            },
          });
        }
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
