import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { id } = req.query;
        const discussionPost = await prisma.discussionPost.findUnique({
            where: {
                id: Number(id)
            }
        });

        return res.status(200).json(discussionPost);
    }
    return res.status(405).end(); // Method Not Allowed
}