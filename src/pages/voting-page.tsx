import {useRouter} from "next/router";
import React from "react";
import {useState} from "react";
import {useEffect} from "react";
import {BsTrash} from 'react-icons/bs';
import styles from '../styles/DiscussionPage.module.css';
import {getUserData, writeUserData} from "@/local-storage/userUtils";

const DiscussionPage: React.FC = () => {
    const [votingNotice, setVotingNotice] = useState<string | null>(null);
    const [willBeVoted, setWillBeVoted] = useState(true);
    const [votingStarted, setVotingStarted] = useState(false);
    const [discussion, setDiscussion] = useState<any>(null);
    const [newProConText, setNewProConText] = useState<string>('');
    const [newProConIdeaId, setNewProConIdeaId] = useState<number>(0);
    const [isPro, setIsPro] = useState<boolean>(true);
    const [user, setUser] = useState<any>(null);
    const [link, setLink] = useState<string>("");

    const router = useRouter();

    const handleReceiveDiscussion = async (link: string) => {
        const url = `/api/receiveDiscussion?link=${link}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });

        const discussion = await response.json();
        if (discussion) {
            const startDate = discussion.vote_start_date;
            const endDate = discussion.vote_end_date;
            if (startDate && endDate) {
                const now = new Date();
                const remainingTimeUntilStart = Date.parse(startDate.toString()) - now.getTime();
                const remainingTimeToEnd = Date.parse(endDate.toString()) - now.getTime();
                if (remainingTimeToEnd < 0) {
                    setVotingNotice(`!!Voting Closed!!`);
                } else if (remainingTimeUntilStart < 0) {
                    setVotingStarted(true);
                    const remainingDaysToEnd = Math.ceil(remainingTimeToEnd / (1000 * 60 * 60 * 24));
                    if (remainingDaysToEnd === 1) {
                        setVotingNotice(`!!Voting Period will End in 1 Day!!`);
                    } else {
                        setVotingNotice(`!!Voting Period will End in ${remainingDaysToEnd} Days!!`);
                    }
                }
            } else {
                setWillBeVoted(false);
            }
            setDiscussion(discussion);
        } else {
            router.push("/");
        }
    }

    useEffect(() => {
        const link = router.query.link;
        if (link) {
            setLink(link as string);
            handleReceiveDiscussion(link as string);
            setUser(getUserData(link as string));
        }
    }, [router.query]);

    const mergeAndSortProsAndCons = (idea: any) => {
        // Make con id's negative so that they are different from pro id's
        // React needs unique keys for each element in a list
        idea.Con.forEach((con: any) => {
            if (con.id > 0) {
                con.id = -con.id;
            }
        });
        const allReviews = idea.Pro.concat(idea.Con);
        return allReviews.sort((a: any, b: any) => {
            return new Date(b.create_date).getTime() - new Date(a.create_date).getTime();
        });
    };

    const copyToClipboard = (text: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Link copied to clipboard');
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        }
    };

    function copyVisitorLink() {
        const selectBox:any = document.getElementById("visitor-links");
        if (selectBox == null) {
            return;
        }
        const selectedValue = selectBox.options[selectBox.selectedIndex].value;
        copyToClipboard(selectedValue);
    }

    return (
        <div>
            {discussion === null ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className={styles.topContainer}>
                        {willBeVoted && (
                            <div className={votingStarted ? styles.votingNoticeStarted : styles.votingNotice}>
                                <span>{votingNotice}</span>
                            </div>
                        )}
                        <div className={styles.votingDates}>
                            {willBeVoted && (
                                <div className={styles.dateContainer}>
                                    <span>Voting Start Date: <span
                                        className={styles.startingDate}>{new Date(discussion.vote_start_date).toLocaleString()}</span></span>
                                </div>
                            )}
                            <div>
                                {discussion.is_admin ? <div>
                                    <button onClick={() => copyToClipboard(window.location.toString())}
                                            className={styles.copyButton}>
                                        Copy Admin Link
                                    </button>
                                    <label>
                                        <select id="visitor-links" defaultValue={"s"} onChange={copyVisitorLink}>
                                            <option value="s" disabled>Copy Visitor Link</option>
                                            {discussion.Group.map((group: any) => (
                                                <option key={group.id}
                                                        value={`${location.origin}/discussion-page?link=${group.VisitorLink[0].link}`}>
                                                    Copy Visitor Link for {group.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div> : <button onClick={() => copyToClipboard(window.location.toString())}
                                                 className={styles.copyButton}>
                                    Copy Visitor Link
                                </button>}
                            </div>
                            {willBeVoted && (
                                <div className={styles.dateContainer}>
                                    <span>Voting End Date: <span
                                        className={styles.endDate}>{new Date(discussion.vote_end_date).toLocaleString()}</span></span>
                                </div>
                            )}
                        </div>
                        {(willBeVoted && discussion.is_admin) && (
                            <div className={styles.votingDates}>
                                {!votingStarted ? <button
                                    className={styles.editButton}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Edit
                                </button> : <p>&#8203;</p>}
                                <button className={styles.editButton}>Edit</button>
                            </div>
                        )}
                        <p className={styles.goalText}>IDEA WHISPER GOAL</p>
                        <div className={styles.ideaWhisperGoal}>
                            <p>{discussion.topic}</p>
                        </div>
                    </div>
                    <br/>
                        {discussion.Idea.map((idea: any) => (
                            <div key={idea.id}>
                                <div className={styles.ideaBox}>
                                    <div className={styles.votingDates}>
                                        <p>{idea.text_body}</p>
                                    </div>
                                </div>
                                {mergeAndSortProsAndCons(idea).map((review: any) => (
                                    <div key={review.id}>
                                        <div className={review.id < 0 ? styles.conBox : styles.proBox}>
                                        </div>
                                        <div className={styles.votingDates}>
                                            <div></div>
                                            {(discussion.is_admin || user.userId == review.created_by) ? <div>
                                                <button>
                                                    <BsTrash/>
                                                </button>
                                                <button className={styles.editButton}>Edit</button>
                                            </div> : <p>&#8203;</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    
                </>
            )}
        </div>
    );
};
export default DiscussionPage;