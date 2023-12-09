import {useRouter} from "next/router";
import React from "react";
import {useState} from "react";
import {useEffect} from "react";
import {BsTrash} from 'react-icons/bs';
import styles from '../styles/DiscussionPage.module.css';
import {getUserData, writeUserData} from "@/local-storage/userUtils";
import { max, set } from "date-fns";
import buttonStyles from '../styles/Button.module.css';
import Chart from 'chart.js/auto';import { useRef } from 'react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface VoteChartProps {
    votesPerDay: number[];
    voteStartDate: string;
    voteEndDate: string;
  }
  
  const VoteChart: React.FC<VoteChartProps> = ({ votesPerDay, voteStartDate, voteEndDate }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
  
    useEffect(() => {
      const ctx = chartRef.current?.getContext('2d');
  
      // Calculate the number of days between voteStartDate and voteEndDate
      const startDate = new Date(voteStartDate).getTime();
      const endDate = new Date(voteEndDate).getTime();
      const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  
      // Create an array of labels representing each day
      const labels = Array.from({ length: days + 1 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + index);
        return date.toLocaleDateString();
      });
  
      // Create the chart
      if (!ctx) {
        return;
      }
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Votes per Day',
              data: votesPerDay,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Votes',
              },
              ticks: {
                precision: 0,
              },
            },
          },
        },
      });
    }, [votesPerDay, voteStartDate, voteEndDate]);
  
    return <canvas ref={chartRef} />;
  };


const DiscussionPage: React.FC = () => {
    const [votingNotice, setVotingNotice] = useState<string | null>(null);
    const [willBeVoted, setWillBeVoted] = useState(true);
    const [votingStarted, setVotingStarted] = useState(false);
    const [votingEnded, setVotingEnded] = useState(false);
    const [discussion, setDiscussion] = useState<any>(null);
    const [showAddIdeaForm, setShowAddIdeaForm] = useState<boolean>(false);
    const [newIdeaText, setNewIdeaText] = useState<string>('');
    const [newProConText, setNewProConText] = useState<string>('');
    const [showAddProConForm, setShowAddProConForm] = useState<boolean>(false);
    const [newProConIdeaId, setNewProConIdeaId] = useState<number>(0);
    const [isPro, setIsPro] = useState<boolean>(true);
    const [user, setUser] = useState<any>(null);
    const [link, setLink] = useState<string>("");
    const [maxNumOfVoting, setMaxNumOfVoting] = useState<number>(0);
    const [checkboxes, setCheckboxes] = useState<string[]>([]);
    const [votesPerDay, setVotesPerDay] = useState<number[]>([]);
    const [seeVotes, setSeeVotes] = useState<boolean>(false);
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
            setMaxNumOfVoting(discussion.max_nof_selections);
            setSeeVotes(discussion.can_see_votes_during_voting);
            setVotesPerDay(discussion.votes_per_day);
            if (startDate && endDate) {
                const now = new Date();
                const remainingTimeUntilStart = Date.parse(startDate.toString()) - now.getTime();
                const remainingTimeUntilEnd = Date.parse(endDate.toString()) - now.getTime();
                if (remainingTimeUntilEnd < 0) {
                    setVotingNotice(`!!Voting Closed!!`);
                    setVotingStarted(true);
                    setVotingEnded(true);
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

    function copyVisitorLink() {
        const selectBox:any = document.getElementById("visitor-links");
        if (selectBox == null) {
            return;
        }
        const selectedValue = selectBox.options[selectBox.selectedIndex].value;
        copyToClipboard(selectedValue);
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, ideaId: string) => {
        const isChecked = e.target.checked;
        console.log(maxNumOfVoting);
        if (isChecked && checkboxes.length >= maxNumOfVoting) {
          return; // Do not allow checking more checkboxes than maxNumOfVoting
        }
      
        if (isChecked) {
          setCheckboxes([...checkboxes, ideaId]);
        } else {
          setCheckboxes(checkboxes.filter((id) => id !== ideaId));
        }
      };

      const handleSubmit = async () => {
        try {
            if(user.hasVoted) {
                toast.error('You have already voted!', {
                  position: toast.POSITION.TOP_RIGHT,
                });
                return;
            }
            const response = await fetch('/api/sendVote', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({votedIdeaIds: checkboxes})
            });
            const data = await response.json();
            if (data.success) {
                user.hasVoted = true;
                console.log(user.hasVoted);
                toast.success('Voted successfully!', {
                    position: toast.POSITION.TOP_RIGHT,
                  });
            } else {
                console.log('Error submitting vote');
            }
        } catch (error) {
            console.error('Error submitting vote:');
        }

      };

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
                                    <label>
                                        <select id="visitor-links" defaultValue={"s"} onChange={copyVisitorLink}>
                                            <option value="s" disabled>Copy Link</option>
                                            <option key={"admin"}
                                                    value={window.location.toString()}>
                                                Copy Admin Link
                                            </option>
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
                        {(!votingStarted)?
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
                            : <p>&#8203;</p>}
                    </div>
                    <br/>
                    <div className={styles.bottomContainer}>
                        {!votingStarted && showAddIdeaForm && (
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
                                {(votingStarted) ? (
                                    <div>
                                        <input
                                            type="checkbox"
                                            checked={checkboxes.includes(idea.id)}
                                            onChange={(e) => handleCheckboxChange(e, idea.id)}
                                        />
                                    </div>
                                ) : (
                                    <p>&#8203;</p>
                                )}
                                <div className={styles.ideaBox}>
                                    <div className={styles.votingDates}>
                                        <p>{idea.text_body}</p>
                                    </div>
                                </div>
                                <div className={styles.votingDates}>
                                    {(!votingStarted)?
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
                                    : <p>&#8203;</p>}
                                    {(!votingStarted && showAddProConForm && idea.id == newProConIdeaId) && (
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
                                    {(!votingStarted && (discussion.is_admin || user.userId == idea.created_by) )? <div>
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
                                            {(!votingStarted && (discussion.is_admin || user.userId == review.created_by) )? <div>
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
                    {votingStarted && !votingEnded && (
                    <div className={styles.submitButtonContainer}>
                        <button onClick={handleSubmit} className={buttonStyles.button} disabled={user.hasVoted}>
                        Submit
                        </button>
                    </div>
                    )}
                    {(votingStarted && seeVotes) ?
                          <VoteChart
                          votesPerDay={votesPerDay}
                          voteStartDate={discussion.vote_start_date}
                          voteEndDate={discussion.vote_end_date}
                        /> : <p>&#8203;</p>}

                </>
            )}
        </div>
    );
};
export default DiscussionPage;