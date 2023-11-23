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
    const [showAddIdeaForm, setShowAddIdeaForm] = useState<boolean>(false);
    const [newIdeaText, setNewIdeaText] = useState<string>('');
    const [newProConText, setNewProConText] = useState<string>('');
    const [showAddProConForm, setShowAddProConForm] = useState<boolean>(false);
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
                const remainingTimeUntilEnd = Date.parse(endDate.toString()) - now.getTime();
                if (remainingTimeUntilEnd < 0) {
                    setVotingNotice(`!!Voting Closed!!`);
                } else if (remainingTimeUntilStart < 0) {
                    setVotingNotice(`!!Voting Started!!`);
                    setVotingStarted(true);
                } else {
                    const remainingDaysUntilStart = Math.ceil(remainingTimeUntilStart / (1000 * 60 * 60 * 24));
                    if (remainingDaysUntilStart === 1) {
                        setVotingNotice(`!!Voting Period will Start in ${remainingDaysUntilStart} Day!!`);
                    } else {
                        setVotingNotice(`!!Voting Period will Start in ${remainingDaysUntilStart} Days!!`);
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

    const toggleAddIdeaForm = () => {
        setShowAddIdeaForm(!showAddIdeaForm);
    };

    const toggleAddProConForm = () => {
        setShowAddProConForm(!showAddProConForm);
    };

    const handleIdeaInputChange = (e: any) => {
        setNewIdeaText(e.target.value);
    };

    const handleProConInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewProConText(e.target.value);
    };

    const submitNewProCon = async () => {
        try {
            const newProCon = {
                text: newProConText,
                ideaID: newProConIdeaId,
                creator: user.userId,
            };
            let url: string;
            if (isPro) {
                url = '/api/createPro';
            } else {
                url = '/api/createCon';
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newProCon)
            });
            const data = await response.json();
            if (data.success) {
                const link = router.query.link;
                if (link) {
                    handleReceiveDiscussion(link as string);
                }
            } else {
                console.log('Error submitting idea:', data);
            }
        } catch (error) {
            console.error('Error submitting idea:', error);
        }
        toggleAddProConForm();
        setNewProConText('');
    };

    const submitNewIdea = async () => {
        try {
            const newIdea = {
                text: newIdeaText,
                discussionID: discussion.id,
                creator: user.userId,
            };
            const response = await fetch('/api/createIdea', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newIdea)
            });
            const data = await response.json();
            if (data.success) {
                const link = router.query.link;
                if (link) {
                    handleReceiveDiscussion(link as string);
                }
            } else {
                console.log('Error submitting idea:', data);
            }
        } catch (error) {
            console.error('Error submitting idea:', error);
        }
        toggleAddIdeaForm();
        setNewIdeaText('');
    };

    async function likeProCon(proConId: number) {
        try {
            const url = "/api/likeProCon";
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    proConId: proConId,
                    isIncrement: !user.liked.has(proConId)
                })
            });
            const data = await response.json();
            if (data.success) {
                const link = router.query.link;
                if (link) {
                    handleReceiveDiscussion(link as string);
                }
            } else {
                console.log('Error while liking:', data);
            }
        } catch (error) {
            console.error('Error while liking:', error);
        }
        if (user.liked.has(proConId)) {
            user.liked.delete(proConId);
        } else {
            user.liked.add(proConId);
        }
        writeUserData(link, user);
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
                                        className={styles.startingDate}>{new Date(discussion.vote_start_date).toLocaleDateString()}</span></span>
                                </div>
                            )}
                            <div>
                                {discussion.is_admin &&
                                    <button onClick={() => copyToClipboard(window.location.toString())}
                                            className={styles.copyButton}>
                                        Copy Admin Link
                                    </button>}
                                {
                                    discussion.VisitorLink.length > 0 &&
                                    <button
                                        onClick={() => copyToClipboard(`${location.origin}/discussion-page?link=${discussion.VisitorLink[0].link}`)}
                                        className={styles.copyButton}>
                                        Copy Visitor Link
                                    </button>
                                }
                            </div>
                            {willBeVoted && (
                                <div className={styles.dateContainer}>
                                    <span>Voting End Date: <span
                                        className={styles.endDate}>{new Date(discussion.vote_end_date).toLocaleDateString()}</span></span>
                                </div>
                            )}
                        </div>
                        {(willBeVoted && discussion.is_admin) && (
                            <div className={styles.votingDates}>
                                <button
                                    className={styles.editButton}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Edit
                                </button>
                                <button className={styles.editButton}>Edit</button>
                            </div>
                        )}
                        <p className={styles.goalText}>IDEA WHISPER GOAL</p>
                        <div className={styles.ideaWhisperGoal}>
                            <p>{discussion.topic}</p>
                        </div>
                        <div className={styles.votingDates}>
                            <button onClick={toggleAddIdeaForm} className={styles.ideaEntryButton}>
                                Add Idea
                            </button>
                            {discussion.is_admin && <div>
                                <button>
                                    <BsTrash/>
                                </button>
                                <button className={styles.editButton}>Edit</button>
                            </div>}
                        </div>
                    </div>
                    <br/>
                    <div className={styles.bottomContainer}>
                        {showAddIdeaForm && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                submitNewIdea();
                            }}>
                                <textarea name="text"
                                          onChange={handleIdeaInputChange}
                                          value={newIdeaText}
                                          rows={4}
                                          cols={50}
                                          placeholder="Enter your idea here..."
                                          className={styles.ideaTextarea}/>
                                <br/>
                                <button className={styles.submitButton} type="submit">Submit Idea</button>
                                <br/><br/>
                            </form>
                        )}
                        {discussion.Idea.map((idea: any) => (
                            <div key={idea.id}>
                                <div className={styles.ideaBox}>
                                    <div className={styles.votingDates}>
                                        <p>{idea.text_body}</p>
                                    </div>
                                </div>
                                <div className={styles.votingDates}>
                                    <div>
                                        <button onClick={() => {
                                            toggleAddProConForm();
                                            setNewProConIdeaId(idea.id);
                                            setIsPro(true);
                                        }} className={styles.addProText}>Add pro
                                        </button>
                                        <button onClick={() => {
                                            toggleAddProConForm();
                                            setNewProConIdeaId(idea.id);
                                            setIsPro(false);
                                        }} className={styles.addConText}>Add con
                                        </button>
                                    </div>
                                    {(showAddProConForm && idea.id == newProConIdeaId) && (
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            submitNewProCon();
                                        }}>
                                            <textarea name="proText"
                                                      onChange={handleProConInputChange}
                                                      value={newProConText}
                                                      rows={4}
                                                      cols={50}
                                                      placeholder="Enter your opinion here..."
                                                      className={styles.ideaTextarea}/>
                                            <button className={styles.submitButton}
                                                    type="submit">Submit {isPro ? "Pro" : "Con"}</button>
                                        </form>
                                    )}
                                    {(discussion.is_admin || user.userId == idea.created_by) ? <div>
                                        <button>
                                            <BsTrash/>
                                        </button>
                                        <button className={styles.editButton}>Edit</button>
                                    </div> : <p>&#8203;</p>}
                                </div>
                                {mergeAndSortProsAndCons(idea).map((review: any) => (
                                    <div key={review.id}>
                                        <div className={review.id < 0 ? styles.conBox : styles.proBox}>
                                            <div className={styles.votingDates}>
                                                <p>{review.text_body}</p>
                                                {discussion.enable_likes && (
                                                    <button onClick={() => likeProCon(review.id)}
                                                            className={styles.likeButton}>+{review.nof_likes}</button>)}
                                            </div>
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
                    </div>
                </>
            )}
        </div>
    );
};
export default DiscussionPage;