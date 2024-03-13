import { eq } from 'drizzle-orm'
import { users } from '~/db/schema'

export const createUserIfNotExists = async (address: string) => {
  const exists = await findUserExists(address)

  if (!exists) {
    await createUser(address)
  }
}

const createUser = async (address: string) => {
  await dbClient.insert(users).values({
    address,
  })
}

const findUserExists = async (address: string) => {
  const user = await dbClient.query.users.findFirst({
    where: eq(users.address, address),
    columns: {
      address: true,
    },
  })

  return !!user
}
