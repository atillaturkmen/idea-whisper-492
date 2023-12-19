import {NextApiRequest, NextApiResponse} from "next";
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {ideaId, userId, isAdmin} = req.body;

            if (ideaId === undefined || userId === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request',
                });
            }

            const idea = await prisma.idea.findUnique({
                where: {
                    id: ideaId,
                },
            });

            if (idea === null) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request',
                });
            }

            if (idea.created_by !== userId && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                });
            }

            await prisma.idea.delete({
                where: {
                    id: ideaId,
                },
            });

            return res.status(200).json({
                success: true,
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
    return res.status(405).end(); // Method Not Allowed
}