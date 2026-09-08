import { Router } from "express";
import { requireSession } from "../middleware/requireSession.js";
import { creatCalendarConnectUrl, getCalendarConnection, refreshCalendarConnection } from "../services/connection.service.js";

export const connectionRouter = Router();

connectionRouter.use(requireSession)

// connectionRouter.get("/", async(req,res)=>{
//     try{
//         const connection = await getCalendarConnection(req.auth!.userId)
//         res.json(connection)
//     }catch{
//        res.status(500).json({error:"could not load connection"})
//     }
// })

connectionRouter.get("/", async (req, res) => {
    try {
        const connection = await getCalendarConnection(req.auth!.userId);

        res.json({
            connection,
        });
    } catch (error) {
        console.error("Could not load connection:", error);

        res.status(500).json({
            error: "could not load connection",
        });
    }
});

connectionRouter.post("/connect", async(req,res)=>{
   try{
         const refreshToken = 
    typeof req.body?.refreshToken === 'string' ? 
    req.body.refreshToken : "";

    if(!refreshToken){
        return res.status(400).json({error:"refresh token required"})
    }

    const redirectUrl = 
    typeof req.body?.redirectUrl === 'string' ?
    req.body.redirectUrl:
    `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard`

    const result = await creatCalendarConnectUrl({
        userId:req.auth!.userId,
        refreshToken,
        redirectUrl
    })

    return res.json(result)
   }catch (error){
    console.error("Failed to connect calendar",error);
       return res.status(500).json({error:"failed to connect calendar"})
   }
})


connectionRouter.post("/refresh-status", async(req,res)=>{
    try{
        const connection = await refreshCalendarConnection({
           userId:req.auth!.userId,
           authUserId:req.auth!.authUserId
        })

        res.json({connection})
    }catch{
        res.status(500).json({error:"failed to refresh the status"})
    }
})