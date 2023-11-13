import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {text, creator, numberOfLikes, creationDate, editDate, editedByAdmin, discussionID} = req.body;

            if (text == null || creator == null || numberOfLikes == null || creationDate == null || discussionID == null) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters',
                });
            }

            if (editDate != null && creationDate >= editDate) {
                return res.status(400).json({
                    success: false,
                    error: 'Creation date must be before edit date',
                });
            }
            if (text.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Text cannot be empty",
                });
            }
            if (numberOfLikes < 0) {
                return res.status(400).json({
                    success: false,
                    error: "Number of likes cannot be negative",
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
                    nof_likes: numberOfLikes,
                    create_date: creationDate,
                    edit_date: editDate,
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
