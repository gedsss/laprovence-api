import { z } from 'zod'

export const CreateLoginSchema = z.object({
  email: z.email('O email deve ser válido'),
  password: z.string(),
})

export type CreateLoginInput = z.infer<typeof CreateLoginSchema>
