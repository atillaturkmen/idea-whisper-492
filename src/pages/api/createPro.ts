import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {text, creator, ideaID} = req.body;
            const creationDate = new Date();

            if (text == null || creator == null || ideaID == null) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters',
                });
            }
            if (text.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Text cannot be empty",
                });
            }

            let idea = await prisma.idea.findUnique({
                where: {
                    id: Number(ideaID)
                }
            });

            if (!idea) {
                return res.status(404).json({
                    success: false,
                    error: 'Idea not found',
                });
            }

            await prisma.pro.create({
                data: {
                    created_by: creator,
                    create_date: creationDate,
                    text_body: text,
                    idIdea: Number(ideaID),
                }
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
