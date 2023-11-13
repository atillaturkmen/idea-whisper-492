import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const {discussion_id} = req.query;

        if (discussion_id == null) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters',
            });
        }

        let ideas = await prisma.idea.findMany({
            where: {
                idDiscussionPost: Number(discussion_id)
            }
        });

        return res.status(200).json(ideas);
    }
    return res.status(405).end(); 
}