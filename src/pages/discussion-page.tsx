import {useRouter} from "next/router";
import { resolve } from "path";
import React from "react";
import {useState} from "react";
import {useEffect} from "react";
import Router from "next/router";


const DiscussionPage: React.FC = () => {
    const [discussion, setDiscussion] = useState("");
    const [ideas, setIdeas] = useState<string[]>([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [allowVoteVisibility, setAllowVoteVisibility] = useState(false);
    const [allowMultipleSelections, setAllowMultipleSelections] = useState(false);
    const [maxSelections, setMaxSelections] = useState(1);
    const router = useRouter();


    const handleReceiveDiscussion = async (admin_link: string) => {
        const url = `/api/receiveDiscussion?link=${admin_link}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });
        try {
            const data = await response.json();
            if (data.status == 200) {
                setDiscussion(data.topic);
                //setIdeas(data.ideas);
                //setStartDate(data.vote_start_date);
                //setEndDate(data.vote_end_date);
                setAllowVoteVisibility(data.can_see_votes_during_voting);
                setAllowMultipleSelections(data.will_be_voted);
                setMaxSelections(data.max_nof_selections);
            } else {
                // Directs to index page
            }
        } catch (error) {
            console.log(error);
        };
    } 
    useEffect(() => {
        const admin_link = router.query.link;
        if (admin_link) {
            handleReceiveDiscussion(admin_link as string);
        }
    }, [router.query]);
    
    return (
        <div>
            <h1>Idea Whisper</h1>
            <h2>{discussion}</h2>
        </div>
    );
}
export default DiscussionPage;