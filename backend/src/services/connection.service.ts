import {CALENDAR_CONNECTION_ID, descopeClient} from "../config/descope.js"
import { Connection } from "../model/calendar.model.js"

function calendarAppId(){
    if(!CALENDAR_CONNECTION_ID){
        throw new Error("CALENDAR_CONNECTION_ID is not present in env")
    }

    return CALENDAR_CONNECTION_ID
}

export async function getCalendarConnection(userId: string){
    const connection = await Connection.findOne({
        userId,
        provider:"calendar",

    });

    return connection
}


export async function creatCalendarConnectUrl(input:{
    userId:string,
    refreshToken:string,
    redirectUrl:string
}){
    const response = await descopeClient.outbound.connect(
        calendarAppId(),
        {redirectUrl:input.redirectUrl},
        input.refreshToken
    )

    if(!response.ok || !response.data?.url){
        throw new Error("could not start connection")
    }

    await Connection.create({
        userId: input.userId,
        provider: "calendar",
        status: "pending",
    });

    return {
        url: response.data.url,
    };
}