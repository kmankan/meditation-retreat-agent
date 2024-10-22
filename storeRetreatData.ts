import { PrismaClient } from '@prisma/client'

interface RetreatData {
  'teacher': string;  // Note the colon in the field name from your JSON
  title: string;
  'start-date': string;
  'end-date': string;
  location: string;
  url: string;
}

export async function importRetreats(retreatData: RetreatData[]) {
  const prisma = new PrismaClient()

  try {
    // Process all retreats in a single transaction
    await prisma.$transaction(async (tx) => {
      for (const retreat of retreatData) {
        // Find or create the teacher
        const teacher = await tx.teacher.upsert({
          where: {
            // Assuming we want to use name as a unique identifier
            name: retreat['teacher'].trim()
          },
          update: {}, // No updates if teacher exists
          create: {
            name: retreat['teacher'].trim()
          }
        })

        // Create the retreat
        await tx.retreat.create({
          data: {
            eventName: retreat.title,
            location: retreat.location,
            startDate: new Date(retreat['start-date']),
            endDate: new Date(retreat['end-date']),
            bookingUrl: retreat.url,
            teacherId: teacher.id
          }
        })
      }
    })

    console.log('Successfully imported retreats')
  } catch (error) {
    console.error('Error importing retreats:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Example usage:
const sampleData = [
  {
    "teacher": "jhourney",
    "title": "Full-time in-person retreat near Playa Del Carmen, Mexico",
    "start-date": "2024-11-12",
    "end-date": "2024-11-20",
    "location": "Near Playa Del Carmen, Mexico",
    "url": "https://pages.jhourney.io/november-playa-del-carmen"
  },
  {
    "teacher": "jhourney",
    "title": "Full-time online retreat",
    "start-date": "2024-11-17",
    "end-date": "2024-11-24",
    "location": "Choose your own location",
    "url": "https://pages.jhourney.io/fall-2024-meditation-retreats"
  },
  {
    "teacher": "jhourney",
    "title": "Full-time online retreat",
    "start-date": "2024-12-06",
    "end-date": "2024-12-13",
    "location": "Choose your own location",
    "url": "https://pages.jhourney.io/fall-2024-meditation-retreats"
  }
]

// Run the import
importRetreats(sampleData)
  .catch(console.error)