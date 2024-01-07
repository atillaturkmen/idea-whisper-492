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

        /**
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
         */

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
            const votesArray = await getVotes(visitorDiscussion);
            const newDiscussion:any = {
                ...visitorDiscussion,
                VisitorLink: [{link: link}],
                is_admin: false,
                votes_per_day: [], // don't give the visitor vote graph data
                votes: votesArray,
            };
            delete newDiscussion.admin_link;
            return res.status(200).json(newDiscussion);
        }
        const votes_per_day = await getVotesPerDay(discussion);
        const votesArray = await getVotes(discussion);
        const newDiscussion = {
            ...discussion,
            is_admin: true,
            votes_per_day: votes_per_day,
            votes: votesArray,
        };

        return res.status(200).json(newDiscussion);
    }
    return res.status(405).end(); 
}

async function getVotesPerDay(discussion: any) {
    // get votes per day
    let votes_per_day:Array<number> = [];
    const startDate = discussion.vote_start_date;
    const endDate = discussion.vote_end_date;
    if (startDate != null && endDate != null) {
        const votesForDiscussion = await prisma.vote.findMany({
            where: {
              Idea: {
                idDiscussionPost: discussion.id,
              },
            },
          });
        type VoteCountMap = { [key: string]: number };
        const voteCountMap: VoteCountMap = votesForDiscussion.reduce((map, vote) => {
            const dateKey = vote.vote_date.toISOString().split('T')[0];
            map[dateKey] = (map[dateKey] || 0) + 1;
            return map;
        }, {} as VoteCountMap);

        // Generate an array for each day in the range
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0];
            votes_per_day.push(voteCountMap[dateKey] || 0);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
    return votes_per_day;
}

async function getVotes(discussion: any) {
    const votes = await prisma.vote.groupBy({
        by: ['idIdea'],
        _count: {
            id: true,
        },
        where: {
            Idea: {
                idDiscussionPost: discussion.id,
            },
        },
    });
    //create an array of the number of votes only
    let votesArray:Array<number> = [];
    let max = 0;
    let maxIndex = 0;
    for (let i = 0; i < votes.length; i++) {
        if (votes[i]._count.id > max) {
            max = votes[i]._count.id;
            maxIndex = i;
        }
        votesArray.push(votes[i]._count.id);
    }
    votesArray[maxIndex] = -1 * votesArray[maxIndex];
    return votesArray;
}
