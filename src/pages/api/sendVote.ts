import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {votedIdeaIds, link, isAdmin} = req.body;
            const voteDate = new Date();

            if (votedIdeaIds == null) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters',
                });
            }
            
            if (votedIdeaIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "User must vote for at least one idea",
                });
            }

            const notFoundIdeas = [];

            for (const ideaId of votedIdeaIds) {
                const idea = await prisma.idea.findUnique({
                    where: {
                    id: Number(ideaId),
                    },
                });

                if (!idea) {
                    notFoundIdeas.push(ideaId);
                }
            }

            if (notFoundIdeas.length > 0) {
            return res.status(404).json({
                success: false,
                error: 'Idea(s) not found',
                notFoundIdeas,
            });
            }
            if (!isAdmin) {
                const visitorLink = await prisma.visitorLink.findFirst({
                    where: {
                        link: String(link),
                    },
                    include: {
                        Group: true,
                    },
                });
                if (!visitorLink) {
                    return res.status(404).json({
                        success: false,
                        error: 'Visitor link not found',
                    });
                }
                if (visitorLink.Group.is_email) {
                    if (visitorLink.has_voted) {
                        return res.status(400).json({
                            success: false,
                            error: 'Visitor has already voted',
                        });
                    } else {
                        await prisma.visitorLink.update({
                            where: {
                                link: String(link),
                            },
                            data: {
                                has_voted: true,
                            },
                        });
                    }
                }
            }
            for (const ideaId of votedIdeaIds) {
                await prisma.vote.create({
                    data: {
                        vote_date: voteDate,
                        idIdea: Number(ideaId),
                    }
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
