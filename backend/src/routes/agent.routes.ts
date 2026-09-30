import {Router} from 'express'
import {z} from 'zod'
import { requireSession } from '../middleware/requireSession.js';

export const agentRoutes = Router();

const chatSchema = z.object({
    message:z.string().trim().min(1).max(5000),
    threadId : z.uuid()
})

const threadIdSchema = z.uuid()

agentRoutes.use(requireSession)

agentRoutes.get('/threads', async(req,res)=>{
    try{
      const threads = await listUserThreads()
      res.json({threads})
    }catch(error){
         const message = error instanceof Error ? error.message : "failed to list threads"
         res.status(500).json({error:message})
    }
})


agentRoutes.get('/threads/:threadId', async(req,res)=>{
    const parsed = threadIdSchema.safeParse(req.params.threadId)

    if(!parsed.success){
        res.status(400).json({error:"invalid threadId"})
        return
    }

    try{
       const messages = await getThreadMessages()
       res.json({threadId : parsed.data, messages})
    }catch(error){
       const message = error instanceof Error ? error.message : "failed to list threads"
         res.status(500).json({error:message}) 
    }
})

agentRoutes.post("/chat",async(req,res)=>{
    const parsed = chatSchema.safeParse(req.body)
    if(!parsed.success){
        res.status(400).json({error:"invalid chat body"})
        return
    }

    res.status(200)
    res.setHeader("Content-Type","text/event-stream")
    res.setHeader("Cache-Control", "no-cache, no-transform")
    res.setHeader("Connection", "keep-alive")
    res.flushHeaders();

    const write = (event:Record<string, unknown>)=>{
        res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    try{
        await streamAgentReply()
    }catch(error){
         const message = error instanceof Error ? error.message : "failed to list threads"
         write({type: "error", message})
    }finally{
        res.end()
    }
})