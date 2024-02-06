import { FastifyInstance } from "fastify"
import z from "zod"
import { prisma } from "../libs/prisma"
import { randomUUID } from "crypto"

export async function voteOnPoll(app: FastifyInstance) {

  app.post('/polls/:pollId/votes', async (req, res) => {
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid()
    })

    const votePollParams = z.object({
      pollId: z.string().uuid()
    })

    const { pollId } = votePollParams.parse(req.params)
    const { pollOptionId } = voteOnPollBody.parse(req.body)

    let { sessionId } = req.cookies

    if(sessionId){
      const userPreviusVoteOnPoll = await prisma.vote.findUnique({
        where:{
          sessionId_pollId:{
            sessionId,
            pollId
          }
        }
      })

      if(userPreviusVoteOnPoll && userPreviusVoteOnPoll.pollOptionId === pollOptionId){
        res.status(400).send({ message: 'You already voted on this poll.'})
      }
      await prisma.vote.delete({
        where:{
          id: userPreviusVoteOnPoll?.id
        }
      })
    }

    if (!sessionId) {
      sessionId = randomUUID()


      res.setCookie('sessionId', sessionId, {
        path: '/',
        // maxAge: 1,
        maxAge: 60 * 60 * 24 * 30, // 30 days,
        signed: true,
        httpOnly: true
      })
    }

    const vote =  await prisma.vote.create({
      data:{
        sessionId,
        pollId,
        pollOptionId
      }
    })

    res.status(201)
      .send(vote)
  })
}