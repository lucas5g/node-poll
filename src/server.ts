import fastify from 'fastify'
import { createPoll } from './routes/create-polls'
import { getPoll } from './routes/get-polls'
import { voteOnPoll } from './routes/vote-on-poll'
import cookie from '@fastify/cookie'
import fastifyWebsocket from '@fastify/websocket'
import { pollResult } from './ws/poll-results'

const app = fastify()


app.register(cookie, {
  secret: 'meu-app',
  hook: 'onRequest',
})

app.register(fastifyWebsocket)

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app.register(pollResult)


app.listen({ port: 3333 })
  .then(() => {
    console.log('HTTP server running!')
  })