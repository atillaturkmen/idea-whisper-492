import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { idea, startDate, endDate, allowVoteVisibility, allowMultipleSelections, maxSelections } = req.body;

        // Here, you'd store the data in your database.
        // For demonstration, let's pretend we've done that and return a success response.
        console.log(idea, startDate, endDate, allowVoteVisibility, allowMultipleSelections, maxSelections);

        return res.status(200).json({ success: true });
    }
    return res.status(405).end(); // Method Not Allowed
}
