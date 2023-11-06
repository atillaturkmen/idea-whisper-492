import {useRouter} from "next/router";
import React from "react";
import {useState} from "react";
import {useEffect} from "react";
import {BsTrash} from 'react-icons/bs';
import styles from '../styles/DiscussionPage.module.css';

const DiscussionPage: React.FC = () => {
    const [remainingDaysToVote, setRemainingDaysToVote] = useState(0);
    const [discussion, setDiscussion] = useState<any>(null);
    const router = useRouter();

    const handleReceiveDiscussion = async (link: string) => {
        const url = `/api/receiveDiscussion?link=${link}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });

        const discussion = await response.json();
        console.log(discussion);
        if (discussion) {
            const endDate = discussion.vote_end_date;
            if (endDate) {
                const now = new Date();
                const remainingTime = Date.parse(endDate.toString()) - now.getTime();
                const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
                setRemainingDaysToVote(remainingDays);
            }
            setDiscussion(discussion);
        } else {
            router.push("/");
        }
    }

    useEffect(() => {
        const link = router.query.link;
        if (link) {
            handleReceiveDiscussion(link as string);
        }
    }, [router.query]);

    const mergeAndSortProsAndCons = (idea: any) => {
        // Make con id's negative so that they are different from pro id's
        // React needs unique keys for each element in a list
        idea.Con.forEach((con: any) => {
            con.id = -con.id;
        });
        const allReviews = idea.Pro.concat(idea.Con);
        return allReviews.sort((a: any, b: any) => {
            return new Date(b.create_date).getTime() - new Date(a.create_date).getTime();
        });
    };

    return (
        <div>
            {discussion === null ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className={styles.topContainer}>
                        <div className={styles.votingNotice}>
                            <span>!!Voting Period will Start in {remainingDaysToVote} Days!!</span>
                        </div>
                        <div className={styles.votingDates}>
                            <div className={styles.dateContainer}>
                                <span>Voting Start Date: <span className={styles.startingDate}>{new Date(discussion.vote_start_date).toLocaleDateString()}</span></span>
                            </div>
                            <div className={styles.dateContainer}>
                                <span>Voting End Date: <span className={styles.endDate}>{new Date(discussion.vote_end_date).toLocaleDateString()}</span></span>
                            </div>
                        </div>
                        <div className={styles.votingDates}>
                            <button
                                className={styles.editButton}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Edit
                            </button>
                            <button className={styles.editButton}>Edit</button>
                        </div>
                        <p className={styles.goalText}>IDEA WHISPER GOAL</p>
                        <div className={styles.ideaWhisperGoal}>
                            <p>{discussion.topic}</p>
                        </div>
                        <div className={styles.votingDates}>
                            <button className={styles.ideaEntryButton}>Add Idea</button>
                            <div>
                                <button>
                                    <BsTrash/>
                                </button>
                                <button className={styles.editButton}>Edit</button>
                            </div>
                        </div>
                    </div>
                    <br/>
                    <div className={styles.bottomContainer}>
                        {discussion.Idea.map((idea: any) => (
                            <>
                                <div key={idea.id} className={styles.ideaBox}>
                                    <div className={styles.votingDates}>
                                        <p>{idea.text_body}</p>
                                        <button className={styles.likeButton}>+{idea.nof_likes}</button>
                                    </div>
                                </div>
                                <div className={styles.votingDates}>
                                    <div>
                                        <button className={styles.addProText}>Add pros</button>
                                        <button className={styles.addConText}>Add cons</button>
                                    </div>
                                    <div>
                                        <button>
                                            <BsTrash/>
                                        </button>
                                        <button className={styles.editButton}>Edit</button>
                                    </div>
                                </div>
                                {mergeAndSortProsAndCons(idea).map((review: any) => (
                                    <div key={review.id}>
                                        <div className={review.id < 0 ? styles.conBox : styles.proBox}>
                                            <div className={styles.votingDates}>
                                                <p>{review.text_body}</p>
                                                <button className={styles.likeButton}>+{review.nof_likes}</button>
                                            </div>
                                        </div>
                                        <div className={styles.votingDates}>
                                            <div></div>
                                            <div>
                                                <button>
                                                    <BsTrash/>
                                                </button>
                                                <button className={styles.editButton}>Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
export default DiscussionPage;