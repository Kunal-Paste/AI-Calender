import { Request, Response, NextFunction } from "express";
import { descopeClient } from "../config/descope.js";
import { User } from "../model/user.model.js";

export type AuthContext = {
    authUserId: string;
    email?: string;
    name?: string;
    userId: string;
    token: Record<string, unknown>;
};

declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}

export async function requireSession(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const header = req.headers.authorization;

    const token = header?.startsWith("Bearer ")
        ? header.slice("Bearer ".length).trim()
        : null;

    if (!token) {
        res.status(401).json({
            error: "Unauthorized",
            success: false,
        });
        return;
    }

    try {
        // 1. Validate Descope session
        const authInfo = await descopeClient.validateSession(token);

        if (!authInfo) {
            res.status(401).json({
                error: "Unauthorized",
                success: false,
            });
            return;
        }

        // 2. Get claims
        const claims = authInfo.token as Record<string, unknown>;

        const authUserId = String(claims.sub ?? "");

        if (!authUserId) {
            res.status(401).json({
                error: "Invalid authentication data",
                success: false,
            });
            return;
        }

        // 3. Find user in MongoDB
        let user = await User.findOne({
            authUserId,
        });

        // 4. If user doesn't exist, create them
        if (!user) {
            user = await User.create({
                authUserId,
                email:
                    typeof claims.email === "string"
                        ? claims.email
                        : "",
                name:
                    typeof claims.name === "string"
                        ? claims.name
                        : "",
            });
        }

        // 5. Attach authentication + MongoDB user information
        req.auth = {
            authUserId,
            email: user.email,
            name: typeof claims.name === "string"
        ? claims.name
        : undefined,
            userId: user._id.toString(),
            token: claims,
        };

        // 6. Continue
        next();

    } catch (err) {
        console.error("Authentication error:", err);

        res.status(401).json({
            error: "Invalid or expired session",
            success: false,
        });
    }
}