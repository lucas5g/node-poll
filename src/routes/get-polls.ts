import { FastifyInstance } from "fastify"
import z from "zod"
import { prisma } from "../libs/prisma"

export async function getPoll(app: FastifyInstance) {

  app.get('/polls/:id', async (req, res) => {
    const createPollParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = createPollParams.parse(req.params)

    const poll = await prisma.poll.findUnique({
      where:{id},
      include:{
        options:{
          select:{
            id: true,
            title:true 
          }
        }
      }
    })

    res.status(201)
      .send(poll)

  })

}