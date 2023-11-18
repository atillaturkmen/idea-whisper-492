import prisma from "@/prisma";

export async function createDiscussion() {
    try {
        const discussion = await prisma.discussionPost.create({
            data: {
                topic: "topic",
                vote_start_date: new Date(),
                vote_end_date: new Date(),
                can_see_votes_during_voting: true,
                max_nof_selections: 3,
                will_be_voted: true,
                admin_link: "admin_link",
                VisitorLink: {
                    create: {
                        link: "visitor_link",
                    },
                },
            }
        });
        return discussion.id;
    } catch (e) {
    }
}

export async function deleteDiscussion() {
    try {
        await prisma.discussionPost.deleteMany(
            {
                where: {
                    admin_link: "admin_link",
                }
            }
        );
    } catch (e) {
    }
}