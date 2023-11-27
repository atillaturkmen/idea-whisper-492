import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {proConId, isIncrement} = req.body;

            if (proConId === undefined || isIncrement === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request',
                });
            }

            if (proConId < 0) {
                await prisma.con.update({
                    where: {
                        id: -proConId,
                    },
                    data: {
                        nof_likes: {
                            increment: isIncrement ? 1 : -1,
                        },
                    },
                });
            } else {
                await prisma.pro.update({
                    where: {
                        id: proConId,
                    },
                    data: {
                        nof_likes: {
                            increment: isIncrement ? 1 : -1,
                        },
                    },
                });
            }

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
