import {NextApiRequest, NextApiResponse} from "next";
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {proConId, userId} = req.body;

            if (proConId === undefined || userId === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request',
                });
            }

            if (proConId < 0) {
                const con = await prisma.con.findUnique({
                    where: {
                        id: -proConId,
                    },
                });
                if (con === null) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid request',
                    });
                }
                if (con.created_by !== userId) {
                    return res.status(403).json({
                        success: false,
                        error: 'Forbidden',
                    });
                }
                await prisma.con.delete({
                    where: {
                        id: -proConId,
                    },
                });
            } else {
                const pro = await prisma.pro.findUnique({
                    where: {
                        id: proConId,
                    },
                });
                if (pro === null) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid request',
                    });
                }
                if (pro.created_by !== userId) {
                    return res.status(403).json({
                        success: false,
                        error: 'Forbidden',
                    });
                }
                await prisma.pro.delete({
                    where: {
                        id: proConId,
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