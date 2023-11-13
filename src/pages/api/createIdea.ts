import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {text, creator, editedByAdmin, discussionID} = req.body;
            const creationDate = new Date();

            if (text == null || creator == null || discussionID == null) {
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

            let discussion = await prisma.discussionPost.findUnique({
                where: {
                    id: Number(discussionID)
                }
            });

            if (!discussion) {
                return res.status(404).json({
                    success: false,
                    error: 'Discussion not found',
                });
            }

            await prisma.idea.create({
                data: {
                    created_by: creator,
                    create_date: creationDate,
                    edited_by_admin: editedByAdmin,
                    text_body: text,
                    idDiscussionPost: Number(discussionID),
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
