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

    const handleReceiveDiscussion = async (link: string) => {
        const url = `/api/receiveDiscussion?link=${link}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });
        const data = await response.json();
        console.log(data);
        if (data != null) {
            setDiscussion(data.topic);
            setIdeas(data.ideas);
            setStartDate(data.vote_start_date);
            setEndDate(data.vote_end_date);
            setAllowVoteVisibility(data.can_see_votes_during_voting);
            setAllowMultipleSelections(data.will_be_voted);
            setMaxSelections(data.max_nof_selections);
            console.log(data);
        } else {
            // Directs to index page
            router.push('/');
        }
    }
    useEffect(() => {
        const link = router.query.link;
        if (link) {
            handleReceiveDiscussion(link as string);
        }
    }, [router.query]);
    return (
        <div>
            <h1>Idea Whisper</h1>

        </div>
    );
}
export default DiscussionPage;