import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/receiveDiscussion';
import prisma from "@/prisma";

async function createDiscussion() {
    try {
        await prisma.discussionPost.create({
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
    } catch (e) {

    }
}

describe('receiveDiscussion API Endpoint', () => {
    let req: NextApiRequest;
    let res: NextApiResponse;

    beforeEach(() => {
        req = {
            method: 'GET',
            query: {},
        } as NextApiRequest;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
        } as unknown as NextApiResponse;
    });

    it('should successfully retrieve a discussion from admin link', async () => {
        await createDiscussion();

        req.query = {
            link: 'admin_link',
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should successfully retrieve a discussion from visitor link', async () => {
        await createDiscussion();

        req.query = {
            link: 'visitor_link',
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 for missing link', async () => {
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 404 for non-existent discussion', async () => {
        req.query = {
            link: 'nonexistent', // Example of a non-existent link
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

});
