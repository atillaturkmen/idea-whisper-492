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

        //votes_per_day is an array of the number of votes that have different vote_date values

        if (discussion) {
            let votes_per_day = await prisma.vote.findMany({
              where: {
                idDiscussionPost: discussion.idDiscussionPost,
              },
              select: {
                date: true,
              },
              groupBy: ['date'],
              _count: {
                date: true,
                as: 'count',
              },
            });
          }

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
                votes_per_day: [0,1,2],
            };
            delete newDiscussion.admin_link;
            return res.status(200).json(newDiscussion);
        }
        const newDiscussion = {
            ...discussion,
            is_admin: true,
            votes_per_day: [5,1,2],
        };

        return res.status(200).json(newDiscussion);
    }
    return res.status(405).end(); 
}