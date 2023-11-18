import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/createPro';
import {createIdea, deleteIdea} from "../../../test-util/createDeleteIdea";

describe('createPro API Endpoint', () => {
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

    it('should create a pro successfully', async () => {
        const ideaID = await createIdea();
        req.body = {
            text: 'New Idea',
            creator: "creator",
            ideaID: ideaID,
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
            })
        );
        await deleteIdea();
    });

    it('should return 400 for missing required parameters', async () => {
        req.body = {};

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 400 for empty text body', async () => {
        const ideaID = await createIdea();
        req.body = {
            text: '',
            creator: "creator",
            ideaID: ideaID,
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        await deleteIdea();
    });
});
