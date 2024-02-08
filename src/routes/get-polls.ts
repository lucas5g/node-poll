import { FastifyInstance } from "fastify"
import z from "zod"
import { prisma } from "../libs/prisma"
import { redis } from "../libs/redis"

export async function getPoll(app: FastifyInstance) {

  app.get('/polls/:id', async (req, res) => {
    const pollParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = pollParams.parse(req.params)

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

    if(!poll){
      return res.status(404).send({ message: 'Poll not found.'})
    }

    const result = await redis.zrange(id, 0, -1, 'WITHSCORES')

    const votes = result.reduce((obj, line, index) => {
      if(index % 2 === 0){
        const score = result[index +1]
        Object.assign(obj, {[line]: Number(score)})
      }

      return obj
    }, {} as Record<string, number>)


    return {
      ...poll, 
      options: poll.options.map(option => {
        return {
          ...option, 
          score: votes[option.id]
          // score: option.id in votes ? votes[option.id] : 0
        }
      })
    }

  })

}