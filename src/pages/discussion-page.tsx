import {useRouter} from "next/router";
import { resolve } from "path";
import React, { use } from "react";
import {useState} from "react";
import {useEffect} from "react";
import styles_page from '../styles/DiscussionPage.module.css';

const DiscussionPage: React.FC = () => {
    const [discussionID, setDiscussionID] = useState(Number);
    const [topic, setTopic] = useState("");
    const [ideas, setIdeas] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [remainingDaysToVote, setRemainingDaysToVote] = useState(0);
    const [allowVoteVisibility, setAllowVoteVisibility] = useState(false);
    const [allowMultipleSelections, setAllowMultipleSelections] = useState(false);
    const [admin, setAdmin] = useState(false);
    const [maxSelections, setMaxSelections] = useState(1);
    const router = useRouter();

    const handleReceiveDiscussion = async (link: string) => {
        const url = `/api/receiveDiscussion?link=${link}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });

        const discussion = await response.json();
        if (discussion) {
            setTopic(discussion.topic);
            setDiscussionID(discussion.id);
            setStartDate(discussion.vote_start_date);
            setEndDate(discussion.vote_end_date);
            setAllowVoteVisibility(discussion.can_see_votes_during_voting);
            setAllowMultipleSelections(discussion.will_be_voted);
            setMaxSelections(discussion.max_nof_selections);
            setAdmin(discussion.is_admin);
        } else { router.push("/"); }
    }

    const handleReceiveIdeas = async (discussion_id: number) => {
        const url = `/api/receiveIdeas?discussion_id=${discussion_id}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });
        const ideas = await response.json();
        if (ideas) {
            setIdeas(ideas);
            console.log(ideas);
        }
    }

    useEffect(() => {
        const link = router.query.link;
        if (link) {
            handleReceiveDiscussion(link as string);
            handleReceiveIdeas(discussionID as number);
        }
    }, [router.query]);

    useEffect(() => {
        handleReceiveIdeas(discussionID as number);
    }, [discussionID]);

    useEffect(() => {
        if (endDate !== null && endDate !== undefined) {
            const now = new Date();
            const remainingTime = Date.parse(endDate.toString())- now.getTime();
            const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
            setRemainingDaysToVote(remainingDays);
        }
      }, [endDate]);
    
    return (
        <div className={styles_page.container}>
            {startDate !== null && endDate !== null ? (
                    <div className={styles_page.timer}> {remainingDaysToVote} days left to vote</div>
            ) : null}
            <div className={styles_page.box}>
                <div className={styles_page.topic}>
                    <h1>{topic}</h1>
                </div>
            </div>
            <h3>{discussionID}</h3>
            <h4>{allowVoteVisibility.toString()}</h4>
        </div>
    );
}
export default DiscussionPage;