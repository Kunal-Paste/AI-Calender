import {google} from "googleapis"
import {randomUUID} from 'node:crypto'
import { getCalendarAccessToken } from "./token.service.js"


function calendarClient(accessToken:string){
    const auth = new google.auth.OAuth2()

    auth.setCredentials({
        access_token:accessToken
    })

    return google.calendar({
        version:'v3',
        auth
    })
}


async function calendarForUser(authUserId:string){
    const accessToken = await getCalendarAccessToken(authUserId)
    return calendarClient(accessToken)
}


export async function listUpcomingMeetings(input: {
    authUserId:string;
    maxResults?:number;
    todayOnly?:boolean;
}){
    const calendar = await calendarForUser(input.authUserId);
    let timeMin = new Date().toISOString();
    let timeMax : string | undefined

    if(input.todayOnly){
        const start = new Date();

        start.setHours(0,0,0,0)

        const end = new Date()
        end.setHours(23,59,59,999)

        timeMin = start.toISOString()
        timeMax = end.toISOString()
    }

    const response = await calendar.events.list({
        calendarId:'primary',
        timeMin,
        timeMax,
        maxResults:input.maxResults ?? 10,
        singleEvents: true,
        orderBy: 'startTime'
    })

    return (response.data.items ?? []).map(formatEvent)
}