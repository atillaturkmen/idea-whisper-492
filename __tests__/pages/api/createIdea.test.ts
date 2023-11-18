import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/createIdea';
import {createDiscussion, deleteDiscussion} from "../../../test-util/createDeleteDiscussion";

describe('createIdea API Endpoint', () => {
    let req: NextApiRequest;
    let res: NextApiResponse;

    beforeEach(() => {
        req = {
            method: 'POST',
            body: {},
        } as NextApiRequest;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
        } as unknown as NextApiResponse;
    });

    it('should create an idea successfully', async () => {
        const discussionID = await createDiscussion();
        req.body = {
            text: 'New Idea',
            creator: "creator",
            discussionID: discussionID,
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
            })
        );
        await deleteDiscussion();
    });

    it('should return 400 for missing required parameters', async () => {
        req.body = {};

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 400 for empty text body', async () => {
        const discussionID = await createDiscussion();
        req.body = {
            text: '',
            discussionID: discussionID,
            creator: "creator",
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        await deleteDiscussion();
    });
});
