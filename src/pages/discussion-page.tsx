import { set } from "date-fns";
import {useRouter} from "next/router";
import React from "react";
import {useState} from "react";
import {useEffect} from "react";


const DiscussionPage: React.FC = () => {
    const [discussion, setDiscussion] = useState("");
    const [ideas, setIdeas] = useState<string[]>([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [allowVoteVisibility, setAllowVoteVisibility] = useState(false);
    const [allowMultipleSelections, setAllowMultipleSelections] = useState(false);
    const [maxSelections, setMaxSelections] = useState(1);
    const router = useRouter();

    const handleReceiveDiscussion = async (id: string) => {
        const url = `/api/recevieDiscussion?id=${id}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        const data = await response.json();
        if (data.success) {
            setDiscussion(data.discussion);
            setIdeas(data.ideas);
            setStartDate(data.vote_start_date);
            setEndDate(data.vote_end_date);
            setAllowVoteVisibility(data.can_see_votes_during_voting);
            setAllowMultipleSelections(data.will_be_voted);
            setMaxSelections(data.max_nof_selections);
        } else {
            // Directs to index page
            router.push('/');
        }
    }
    useEffect(() => {
        const id = router.query.id as string;
        if (id) {
            handleReceiveDiscussion(id);
        }
    }, []);
    return (
        <div>
            <h1>Idea Whisper</h1>

            <div>{discussion}</div>
            <div>{ideas}</div>
            <div>{allowVoteVisibility}</div>
            <div>{allowMultipleSelections}</div>
            <div>{maxSelections}</div>
        </div>
    );
}
export default DiscussionPage;