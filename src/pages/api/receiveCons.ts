import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const {idea_id} = req.query;

        if (idea_id == null) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters',
            });
        }

        let cons = await prisma.con.findMany({
            where: {
                idIdea: Number(idea_id)
            }
        });

        return res.status(200).json(cons);
    }
    return res.status(405).end(); 
}