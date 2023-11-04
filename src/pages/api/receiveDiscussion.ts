import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { link } = req.query;
        let discussion = await prisma.discussionPost.findFirst({
            where: {
                admin_link: String(link)
            }
        });

        if (!discussion) {
            let visitor_link = await prisma.visitorLink.findFirst({
                where: {
                    link: String(link) 
                }
            });
            if (!visitor_link) {
                return res.status(404).json(discussion);
            }
            discussion = await prisma.discussionPost.findFirst({
                where: {
                    id: visitor_link.idDiscussionPost
                }
            });
            const newDiscussion = {
                ...discussion,
                is_admin: false,
            };
            return res.status(200).json(newDiscussion);
        }
        const newDiscussion = {
            ...discussion,
            is_admin: true,
        };
        
        return res.status(200).json(newDiscussion);
    }
    return res.status(405).end(); 
}