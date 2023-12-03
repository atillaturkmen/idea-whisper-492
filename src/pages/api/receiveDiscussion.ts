import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { link } = req.query;
        let discussion = await prisma.discussionPost.findFirst({
            where: {
                admin_link: String(link)
            },
            include: {
                Idea: {
                    include: {
                        Pro: true,
                        Con: true,
                    }
                },
                Group: {
                    include: {
                        VisitorLink: true,
                    }
                },
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
            const group = await prisma.group.findFirst({
                where: {
                    id: visitor_link.idGroup
                },
                include: {
                    DiscussionPost: {
                        include: {
                            Idea: {
                                include: {
                                    Pro: true,
                                    Con: true,
                                }
                            }
                        }
                    },
                    VisitorLink: true,
                }
            });
            if (!group) {
                return res.status(404).json(discussion);
            }
            const visitorDiscussion = group.DiscussionPost;
            const newDiscussion:any = {
                ...visitorDiscussion,
                VisitorLink: [{link: link}],
                is_admin: false,
            };
            delete newDiscussion.admin_link;
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