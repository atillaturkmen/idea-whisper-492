import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from "@/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {
                topic,
                startDate,
                endDate,
                allowVoteVisibility,
                allowMultipleSelections,
                maxSelections,
                enableLikes,
                filteredGroupNames,
            } = req.body;

            if (topic == null || allowVoteVisibility == null || allowMultipleSelections == null || maxSelections == null
                || (startDate == null && endDate != null) || (startDate != null && endDate == null) || enableLikes == null) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters',
                });
            }

            if (startDate != null && endDate != null) {
                if (startDate >= endDate) {
                    return res.status(400).json({
                        success: false,
                        error: 'Start date must be before end date',
                    });
                }
                if (endDate < new Date()) {
                    return res.status(400).json({
                        success: false,
                        error: "End date must be in the future",
                    });
                }
            }

            if (topic.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Topic cannot be empty",
                });
            }
            if (allowMultipleSelections && maxSelections < 1) {
                return res.status(400).json({
                    success: false,
                    error: "Maximum selections must be at least 1",
                });
            }

            // check if group names are shorter than 255 characters
            for (let i = 0; i < filteredGroupNames.length; i++) {
                if (filteredGroupNames[i].length > 255) {
                    return res.status(400).json({
                        success: false,
                        error: "Group names must be shorter than 255 characters",
                    });
                }
            }

            const randomAdminLink = generateRandomLink(255);

            // create random links for each group
            const randomVisitorLinks: Array<any> = [];
            for (let i = 0; i < filteredGroupNames.length; i++) {
                randomVisitorLinks.push({
                    link: generateRandomLink(255),
                    group_name: filteredGroupNames[i],
                });
            }

            await prisma.discussionPost.create({
                data: {
                    topic: topic,
                    vote_start_date: startDate,
                    vote_end_date: endDate,
                    can_see_votes_during_voting: allowVoteVisibility,
                    max_nof_selections: maxSelections,
                    will_be_voted: allowMultipleSelections,
                    admin_link: randomAdminLink,
                    enable_likes: enableLikes,
                    Group: {
                        create: randomVisitorLinks.map(group => ({
                            name: group.group_name,
                            is_email: false,
                            VisitorLink: {
                                create: {
                                    link: group.link
                                }
                            }
                        })),
                    },
                }
            });
            return res.status(200).json({
                success: true,
                adminLink: randomAdminLink,
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
