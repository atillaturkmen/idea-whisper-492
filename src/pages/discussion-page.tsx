import {useRouter} from "next/router";
import React from "react";
import {useState} from "react";
import {useEffect} from "react";
import {BsTrash} from 'react-icons/bs';
import styles from '../styles/DiscussionPage.module.css';
import {getUserData, writeUserData} from "@/local-storage/userUtils";
import buttonStyles from '../styles/Button.module.css';
import VoteChart from '@/components/VoteChart';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';


import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

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
    const [editingProConId, setEditingProConId] = useState<number | null>(null);
    const [editingProConText, setEditingProConText] = useState<string>('');
    const [editingIdeaId, setEditingIdeaId] = useState<number | null>(null);
    const [editingIdeaText, setEditingIdeaText] = useState<string>('');
    const [editingTopic, setEditingTopic] = useState<boolean>(false);
    const [newTopicText, setNewTopicText] = useState<string>('');
    const [userTypeNotice, setUserTypeNotice] = useState<string>('');
    const [openDialogForAdmin, setOpenDialogForAdmin] = useState<boolean>(false);
    const [openDialogForVisitor, setOpenDialogForVisitor] = useState<boolean>(false);
    const router = useRouter();

    const handleOpenDialogForAdmin = () => {
        setOpenDialogForAdmin(true);
    }
    
    const handleCloseDialogForAdmin = () => {
        setOpenDialogForAdmin(false);
    }

    const handleOpenDialogForVisitor = () => {
        setOpenDialogForVisitor(true);
    }

    const handleCloseDialogForVisitor = () => {
        setOpenDialogForVisitor(false);
    }

    const handleReceiveDiscussion = async (link: string) => {
        const url = `/api/receiveDiscussion?link=${link}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });

        const discussion = await response.json();
        if (discussion) {
            if (discussion.is_admin) {
                setUserTypeNotice("You are viewing this discussion as Admin.");
            } else {
                setUserTypeNotice("You are viewing this discussion as Visitor.");
            }
            const startDate = discussion.vote_start_date;
            const endDate = discussion.vote_end_date;
            setMaxNumOfVoting(discussion.max_nof_selections);
            setVotesPerDay(discussion.votes_per_day);
            if (startDate && endDate) {
                const now = new Date();
                const remainingTimeUntilStart = Date.parse(startDate.toString()) - now.getTime();
                const remainingTimeUntilEnd = Date.parse(endDate.toString()) - now.getTime();
            
                const formatTime = (days: number, hours: number, minutes: number): string => {
                    let formattedTime = '';
                    if (days > 0) {
                        formattedTime += `${days} day${days > 1 ? 's' : ''} `;
                    }
                    if (hours > 0 || (days > 0 && minutes === 0)) {
                        formattedTime += `${hours} hour${hours > 1 ? 's' : ''} `;
                    }
                    if (minutes > 0 || (days === 0 && hours === 0)) {
                        formattedTime += `${minutes} minute${minutes > 1 ? 's' : ''}`;
                    }
                    return formattedTime.trim();
                };
            
                if (remainingTimeUntilEnd < 0) {
                    setVotingNotice(`!!Voting Closed!!`);
                    setVotingStarted(true);
                    setVotingEnded(true);
                } else if (remainingTimeUntilStart < 0) {
                    setVotingNotice(`!!Voting Started!!`);
                    setVotingStarted(true);
                } else {
                    const remainingDaysUntilStart = Math.floor(remainingTimeUntilStart / (1000 * 60 * 60 * 24));
                    const remainingHoursUntilStart = Math.floor((remainingTimeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const remainingMinutesUntilStart = Math.ceil((remainingTimeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
                    if (remainingDaysUntilStart>1){
                        setVotingNotice(`!!Voting Period will Start in ${remainingDaysUntilStart} Days!!`);
                    } else{
                    setVotingNotice(`!!Voting Period will Start in ${formatTime(remainingDaysUntilStart, remainingHoursUntilStart, remainingMinutesUntilStart)}!!`);
                    }
                }
            }
            else {
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

    // Function to toggle the edit form
    const toggleEditProConForm = (proConId: number, currentText: string) => {
        setEditingProConId(proConId);
        setEditingProConText(currentText);
    };

    // Function to handle edit form input change
    const handleEditProConInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingProConText(e.target.value);
    };

    // Function to submit the edited pro/con
    const submitEditProCon = async () => {
        try {
            const newProCon = {
                proConId: editingProConId,
                userId: user.userId,
                newProConBody: editingProConText,
                link: link,
            };
            let url: string = "/api/editProCon";
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
                console.log('Error editing pro con:', data);
            }
        } catch (error) {
            console.error('Error editing pro con:', error);
        }
        setEditingProConId(null);
        setEditingProConText('');
    };

    // Function to toggle the edit idea form
    const toggleEditIdeaForm = (ideaId: number, currentText: string) => {
        setEditingIdeaId(ideaId);
        setEditingIdeaText(currentText);
    };

    // Function to handle edit idea form input change
    const handleEditIdeaInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingIdeaText(e.target.value);
    };

    // Function to submit the edited idea
    const submitEditIdea = async () => {
        try {
            const newIdea = {
                ideaId: editingIdeaId,
                userId: user.userId,
                newIdeaBody: editingIdeaText,
                link: link,
            };
            let url: string = "/api/editIdea";
            const response = await fetch(url, {
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
                console.log('Error editing idea:', data);
            }
        } catch (error) {
            console.error('Error editing idea:', error);
        }
        setEditingIdeaId(null);
        setEditingIdeaText('');
    };

    // Function to toggle the edit topic form
    const toggleEditTopicForm = () => {
        setEditingTopic(!editingTopic);
        setNewTopicText(discussion.topic); // Reset text to current topic when toggling
    };

    // Function to handle edit topic form input change
    const handleEditTopicInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewTopicText(e.target.value);
    };

    // Function to submit the edited topic
    const submitEditTopic = async () => {
        try {
            const newTopic = {
                discussionId: discussion.id,
                newTopicBody: newTopicText,
                admin_link: link,
            };
            let url: string = "/api/editTopic";
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newTopic)
            });
            const data = await response.json();
            if (data.success) {
                const link = router.query.link;
                if (link) {
                    handleReceiveDiscussion(link as string);
                }
            } else {
                console.log('Error editing topic:', data);
            }
        } catch (error) {
            console.error('Error editing topic:', error);
        }
        setEditingTopic(false);
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
                if (user.liked.has(proConId)) {
                    user.liked.delete(proConId);
                } else {
                    user.liked.add(proConId);
                }
                writeUserData(link, user);
                if (link) {
                    handleReceiveDiscussion(link as string);
                }
            } else {
                console.log('Error while liking:', data);
            }
        } catch (error) {
            console.error('Error while liking:', error);
        }
    }

    async function deleteProCon(proConId: number) {
        // alert to confirm deletion
        if (!confirm("Are you sure you want to delete this?")) return;
        try {
            const url = "/api/deleteProCon";
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    proConId: proConId,
                    userId: user.userId,
                    isAdmin: discussion.is_admin,
                })
            });
            const data = await response.json();
            if (data.success) {
                if (user.writtenPros.has(proConId)) {
                    user.writtenPros.delete(proConId);
                }
                if (user.writtenCons.has(proConId)) {
                    user.writtenCons.delete(proConId);
                }
                writeUserData(link, user);
                if (link) {
                    handleReceiveDiscussion(link as string);
                }
            } else {
                console.log('Error while deleting:', data);
            }
        } catch (error) {
            console.error('Error while deleting:', error);
        }
    }

    async function deleteIdea(ideaId: number) {
        // alert to confirm deletion
        if (!confirm("Are you sure you want to delete this idea?")) return;
        try {
            const url = "/api/deleteIdea";
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ideaId: ideaId,
                    userId: user.userId,
                    isAdmin: discussion.is_admin,
                })
            });
            const data = await response.json();
            if (data.success) {
                if (user.writtenIdeas.has(ideaId)) {
                    user.writtenPros.delete(ideaId);
                }
                writeUserData(link, user);
                if (link) {
                    handleReceiveDiscussion(link as string);
                }
            } else {
                console.log('Error while deleting:', data);
            }
        } catch (error) {
            console.error('Error while deleting:', error);
        }
    }

    async function deleteDiscussion() {
        // alert to confirm deletion
        if (!confirm("Are you sure you want to delete this discussion?")) return;
        try {
            const url = "/api/deleteDiscussion";
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    discussionId: discussion.id,
                    admin_link: link,
                })
            });
            const data = await response.json();
            if (data.success) {
                if (link) {
                    handleReceiveDiscussion(link as string);
                }
            } else {
                console.log('Error while deleting:', data);
            }
        } catch (error) {
            console.error('Error while deleting:', error);
        }
    }

    function copyVisitorLink() {
        const selectBox: any = document.getElementById("visitor-links");
        if (selectBox == null) {
            return;
        }
        const selectedValue = selectBox.options[selectBox.selectedIndex].value;
        copyToClipboard(selectedValue);
    }
    

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, ideaId: string) => {
        const isChecked = e.target.checked;
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
            if (user.hasVoted) {
                toast.error('You have already voted!', {
                    position: toast.POSITION.TOP_RIGHT,
                });
                return;
            }
            const response = await fetch('/api/sendVote', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    votedIdeaIds: checkboxes,
                    link: link,
                    isAdmin: discussion.is_admin,
                })
            });
            const data = await response.json();
            if (data.success) {
                user.hasVoted = true;
                writeUserData(link, user);
                toast.success('Voted successfully!', {
                    position: toast.POSITION.TOP_RIGHT,
                });
            } else {
                console.log('Error submitting vote: ' + data.error);
                toast.error('You have already voted with this link!', {
                    position: toast.POSITION.TOP_RIGHT,
                });
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
                            <div className={styles.adminMessage}>
                                <span>{userTypeNotice}</span>
                            </div>
                        <div className={styles.votingDates}>
                            {willBeVoted && (
                                <div className={styles.dateContainer}>
                                    <span>Voting Start Date: <span
                                        className={styles.startingDate}>{new Date(discussion.vote_start_date).toLocaleString(undefined, {timeZoneName: 'short'})}</span></span>
                                </div>
                            )}
                            <div>
                                {discussion.is_admin ? 
                                <React.Fragment>
                                <Button variant="contained" color="success" onClick={handleOpenDialogForAdmin}>
                                    See links
                               </Button>
                               <Dialog
                               open={openDialogForAdmin}
                               TransitionComponent={Transition}
                               keepMounted
                               onClose={handleCloseDialogForAdmin}
                               aria-describedby="alert-dialog-slide-description"
                             ><DialogTitle>{"You can copy and share links with others!"}</DialogTitle>
                             <DialogContent>
                               <DialogContentText id="alert-dialog-slide-description">
                                                            Admin link: {window.location.toString()} <br/>
                                                            {discussion.Group.map((group: any) => (
                                <div key={group.id}>
                                    Visitor Link for {group.name}: {`${location.origin}/discussion-page?link=${group.VisitorLink[0].link}`}
                                </div>
                                ))}
                               </DialogContentText>
                             </DialogContent>
                             <DialogActions>
                               <Button onClick={handleCloseDialogForAdmin}>OK</Button>
                             </DialogActions>
                           </Dialog>
                                 </React.Fragment>
                                :        
                                <React.Fragment>
                                <Button variant="contained" color="success" onClick={handleOpenDialogForVisitor}>
                                    See visitor link
                              </Button>
                              <Dialog
                              open={openDialogForVisitor}
                              TransitionComponent={Transition}
                              keepMounted
                              onClose={handleCloseDialogForVisitor}
                              aria-describedby="alert-dialog-slide-description"
                            ><DialogTitle>{"You can copy and share visitor link with others!"}</DialogTitle>
                            <DialogContent>
                              <DialogContentText id="alert-dialog-slide-description">
                              http://34.83.178.232/discussion-page?link={link}
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleCloseDialogForVisitor}>OK</Button>
                            </DialogActions>
                          </Dialog>
                                </React.Fragment>}
                            </div>
                            {willBeVoted && (
                                <div className={styles.dateContainer}>
                                    <span>Voting End Date: <span
                                        className={styles.endDate}>{new Date(discussion.vote_end_date).toLocaleString(undefined, {timeZoneName: 'short'})}</span></span>
                                </div>
                            )}
                        </div>
                        {/* 
                        {(willBeVoted && discussion.is_admin) && (
                            <div className={styles.votingDates}>
                                {!votingStarted ? <button
                                    className={styles.editButton}>Edit
                                </button> : <p>&#8203;</p>}
                                {!votingEnded ?<button className={styles.editButton}>Edit</button>: <p>&#8203;</p>}
                            </div>
                        )} 
                        */}
                        <p className={styles.goalText}>IDEA WHISPER GOAL</p>
                        <div className={styles.ideaWhisperGoal}>
                            <p>{discussion.topic}</p>
                        </div>
                        {(!votingStarted) ?
                            <div className={styles.votingDates}>
                                <button onClick={toggleAddIdeaForm} className={styles.ideaEntryButton}>
                                    Add Idea
                                </button>
                                {discussion.is_admin && <div>
                                    {editingTopic ? <div>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            submitEditTopic();
                                        }}>
                                            <textarea
                                                value={newTopicText}
                                                onChange={handleEditTopicInputChange}
                                                rows={4}
                                                cols={50}
                                            />
                                            <button type="submit">Save Changes</button>
                                        </form>
                                    </div> : <div>
                                        <button onClick={deleteDiscussion}>
                                            <BsTrash/>
                                        </button>
                                        <button className={styles.editButton} onClick={toggleEditTopicForm}>Edit</button>
                                    </div>}
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
                        {discussion.Idea.map((idea: any,index: number) => (
                            <div key={idea.id}
                            >
                                {(votingStarted && !votingEnded) ? (
                                <div>
                                    <input
                                    type="checkbox"
                                    checked={checkboxes.includes(idea.id)}
                                    onChange={(e) => handleCheckboxChange(e, idea.id)}
                                    />
                                </div>
                                ) : (
                                (votingEnded) ? (
                                    <p style={{ marginBottom: '1px', fontWeight: 'bold', fontStyle: 'italic' }}>
                                    {discussion.votes[index] < 0 ? -discussion.votes[index] : discussion.votes[index]}{' '}
                                    {discussion.votes[index] === 1 || discussion.votes[index] === -1 ? 'vote' : 'votes'}
                                    </p>                                ) : (
                                    <p>&#8203;</p>
                                )
                                )}
                                <div className={ !votingEnded? styles.ideaBox: discussion.votes[index] < 0 ? styles.ideaVoteWinner:styles.ideaVoteLoser}>
                                    <div className={styles.votingDates}>
                                        <p>{idea.text_body}</p>
                                    </div>
                                </div>
                                <div className={styles.votingDates}>
                                    {(!votingStarted) ?
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
                                    {editingIdeaId === idea.id ? (
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            submitEditIdea();
                                        }}>
                                            <textarea
                                                value={editingIdeaText}
                                                onChange={handleEditIdeaInputChange}
                                                rows={4}
                                                cols={50}
                                            />
                                            <button type="submit">Save Changes</button>
                                        </form>
                                    ) : <div>
                                        {(!votingStarted && (discussion.is_admin || user.userId == idea.created_by)) ? <div>
                                            <button onClick={() => deleteIdea(idea.id)}>
                                                <BsTrash/>
                                            </button>
                                            <button
                                                className={styles.editButton}
                                                onClick={() => toggleEditIdeaForm(idea.id, idea.text_body)}>
                                                Edit
                                            </button>
                                        </div> : <p>&#8203;</p>}
                                    </div>}
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
                                            {editingProConId === review.id ? (
                                                <form onSubmit={(e) => {
                                                    e.preventDefault();
                                                    submitEditProCon();
                                                }}>
                                                    <textarea
                                                        value={editingProConText}
                                                        onChange={handleEditProConInputChange}
                                                        rows={4}
                                                        cols={50}
                                                    />
                                                    <button type="submit">Save Changes</button>
                                                </form>
                                            ) : <div>{(!votingStarted && (discussion.is_admin || user.userId == review.created_by)) ?
                                                <div>
                                                    <button onClick={() => deleteProCon(review.id)}>
                                                        <BsTrash/>
                                                    </button>
                                                    <button
                                                        className={styles.editButton}
                                                        onClick={() => toggleEditProConForm(review.id, review.text_body)}>
                                                        Edit
                                                    </button>
                                                </div> : <p>&#8203;</p>}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    {votingStarted && !votingEnded && (
                        <div className={styles.submitButtonContainer}>
                            <button onClick={handleSubmit} className={buttonStyles.button}>
                                Submit
                            </button>
                        </div>
                    )}
                    {(votingStarted && discussion.is_admin) ?
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