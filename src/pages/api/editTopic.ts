import {NextApiRequest, NextApiResponse} from "next";
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {discussionId, admin_link, newTopicBody} = req.body;

            if (discussionId === undefined || admin_link === undefined || newTopicBody === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request',
                });
            }

            const discussion = await prisma.discussionPost.findUnique({
                where: {
                    id: discussionId,
                },
            });
            if (discussion === null) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request',
                });
            }
            if (discussion.admin_link !== admin_link) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                });
            }
            await prisma.discussionPost.update({
                where: {
                    id: discussionId,
                },
                data: {
                    topic: newTopicBody,
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