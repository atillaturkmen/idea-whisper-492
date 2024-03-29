import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from "@/prisma";
import {sendMail} from "@/email/sendMail";
const validator = require('validator');

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
                groups,
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
            for (let i = 0; i < groups.length; i++) {
                if (groups[i].name.length > 255) {
                    return res.status(400).json({
                        success: false,
                        error: "Group names must be shorter than 255 characters",
                    });
                }
            }

            const randomAdminLink = generateRandomLink(255);

            const groupData = groups.map((group: any) => {
                if (!group.isEmailCollector) {
                    // For non-email groups, create one visitor link per group
                    return {
                        name: group.name,
                        is_email: false,
                        VisitorLink: {
                            create: {
                                link: generateRandomLink(255)
                            }
                        }
                    };
                } else {
                    group.emailList.filter((email: string) => {
                        return validator.isEmail(email);
                    });
                    // For email groups, create a visitor link for each email
                    const emailLinks = group.emailList.map(() => ({
                        link: generateRandomLink(255),
                    }));

                    emailLinks.forEach((emailLink: any, index: number) => {
                        sendMail(group.emailList[index], process.env.DOMAIN_NAME + "/discussion-page?link=" + emailLink.link);
                    });

                    return {
                        name: group.name,
                        is_email: true,
                        VisitorLink: {
                            create: emailLinks
                        }
                    };
                }
            });

            // if no groups were selected, create a default group
            if (groupData.length === 0) {
                groupData.push({
                    name: "default",
                    is_email: false,
                    VisitorLink: {
                        create: {
                            link: generateRandomLink(255)
                        }
                    }
                });
            }

            await prisma.discussionPost.create({
                data: {
                    topic: topic,
                    vote_start_date: startDate,
                    vote_end_date: endDate,
                    can_see_votes_during_voting: allowVoteVisibility,
                    max_nof_selections: maxSelections,
                    will_be_voted: startDate != null,
                    admin_link: randomAdminLink,
                    enable_likes: enableLikes,
                    Group: {
                        create: groupData,
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
