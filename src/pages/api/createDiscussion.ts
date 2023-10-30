import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {idea, startDate, endDate, allowVoteVisibility, allowMultipleSelections, maxSelections} = req.body;

            const randomAdminLink = generateRandomLink(255);

            const randomVisitorLink = generateRandomLink(255);

            await prisma.discussionPost.create({
                data: {
                    topic: idea,
                    vote_start_date: startDate,
                    vote_end_date: endDate,
                    can_see_votes_during_voting: allowVoteVisibility,
                    max_nof_selections: maxSelections,
                    will_be_voted: allowMultipleSelections,
                    admin_link: randomAdminLink,
                    VisitorLink: {
                        create: {
                            link: randomVisitorLink,
                        },
                    },
                }
            });
            res.status(200).json({
                success: true,
                adminLink: randomAdminLink,
                visitorLink: randomVisitorLink,
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

function generateRandomLink(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let link = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        link += characters.charAt(randomIndex);
    }

    return link;
}
