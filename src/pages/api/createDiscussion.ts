import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { idea, startDate, endDate, allowVoteVisibility, allowMultipleSelections, maxSelections } = req.body;

        const newDiscussionPost = await prisma.discussionPost.create({
            data: {
                topic: idea, // You can set this value based on your requirements
                vote_start_date: startDate,
                vote_end_date: endDate,
                can_see_votes_during_voting: allowVoteVisibility,
                max_nof_selections: maxSelections,
                will_be_voted: allowMultipleSelections,
                admin_link: "https://example.com",
            }
        });

        console.log(idea, startDate, endDate, allowVoteVisibility, allowMultipleSelections, maxSelections);
        console.log(newDiscussionPost);

        return res.status(200).json({ success: true });
    }
    return res.status(405).end(); // Method Not Allowed
}
