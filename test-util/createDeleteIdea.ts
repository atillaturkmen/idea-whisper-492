import prisma from "@/prisma";
import {createDiscussion, deleteDiscussion} from "./createDeleteDiscussion";

export async function createIdea() {
    const discussionID = await createDiscussion() as number;
    try {
        const idea = await prisma.idea.create({
            data: {
                created_by: "creator",
                create_date: new Date(),
                edited_by_admin: false,
                text_body: "New Idea",
                idDiscussionPost: discussionID,
            }
        });
        return idea.id;
    } catch (e) {
    }
}

export async function deleteIdea() {
    await deleteDiscussion();
}