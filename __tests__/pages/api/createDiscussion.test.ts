import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/createDiscussion';

describe('createDiscussion API Endpoint', () => {
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

    it('should create a discussion successfully', async () => {
        req.body = {
            topic: 'New Discussion Topic',
            startDate: new Date('2023-12-01'),
            endDate: new Date('2023-12-10'),
            allowVoteVisibility: true,
            allowMultipleSelections: true,
            maxSelections: 3,
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                adminLink: expect.stringMatching(/^.{255}$/),
                visitorLink: expect.stringMatching(/^.{255}$/)
            })
        );
    });

    it('should return 400 for missing required parameters', async () => {
        req.body = {};

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 400 when start date is after end date', async () => {
        req.body = {
            topic: 'Discussion Topic',
            startDate: new Date('2023-12-10'),
            endDate: new Date('2023-12-01'),
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 400 for end date in the past', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // Set to yesterday

        req.body = {
            topic: 'Discussion Topic',
            startDate: new Date(),
            endDate: pastDate,
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
});
