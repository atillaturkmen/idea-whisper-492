import React, {useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactModal from 'react-modal';
import styles_modal from '../styles/Modal.module.css';
import styles_page from '../styles/PostCreation.module.css';
import buttonStyles from '../styles/Button.module.css';

const PostCreation: React.FC = () => {
    const [topic, setTopic] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [allowVoteVisibility, setAllowVoteVisibility] = useState(false);
    const [allowMultipleSelections, setAllowMultipleSelections] = useState(false);
    const [maxSelections, setMaxSelections] = useState(1);
    const [adminLink, setAdminLink] = useState<string>("");
    const [visitorLink, setVisitorLink] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const Modal: React.FC<{ isOpen: boolean; onRequestClose: () => void }> = ({
                                                                                  isOpen,
                                                                                  onRequestClose,
                                                                              }) => (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Admin and Visitor Links"
            ariaHideApp={false}
            className={styles_modal.modalContainer}
        >
            {adminLink && visitorLink ? (
                <div className={styles_modal.modalContent}>
                    <b>ENSURE THAT YOU SAVE THESE LINKS SOMEWHERE BECAUSE THEY WILL BE LOST ONCE YOU CLOSE THIS
                        WINDOW!</b>
                    <br/><br/>
                    <h2>Admin Link:</h2>
                    <p className={styles_modal.link}>{adminLink}</p>
                    <br/><br/>
                    <p>The Admin Link is a confidential and special access link for discussion administrators or
                        moderators. It empowers them with advanced control over the discussion, enabling actions like
                        editing or removing posts, managing user accounts, and ensuring discussion quality. This link is
                        kept private and is not visible to regular users.</p>
                    <br/><br/>
                    <h2>Visitor Link:</h2>
                    <p className={styles_modal.link}>{visitorLink}</p>
                    <br/><br/>
                    <p>The Visitor Link is your invitation to join and engage in the discussion. Clicking this link
                        grants you access to the conversation, allowing you to post comments, replies, and even vote on
                        poll questions. It&apos;s a simple way to participate and share your thoughts within the
                        discussion community.</p>
                    <br/><br/>
                    <button className={buttonStyles.button}>Go to discussion page</button>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </ReactModal>
    );

    const handleSubmit = async () => {
        handleOpenModal();
        const response = await fetch('/api/createDiscussion', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                topic: topic,
                startDate,
                endDate,
                allowVoteVisibility,
                allowMultipleSelections,
                maxSelections
            })
        });

        const data = await response.json();
        if (data.success) {
            const adminLink = `${window.location.origin}/discussion/${data.adminLink}`;
            const visitorLink = `${window.location.origin}/discussion/${data.visitorLink}`;
            setAdminLink(adminLink);
            setVisitorLink(visitorLink);
        } else {
            handleCloseModal();
            alert(data.error);
        }
    };

    return (
        <div className={styles_page.container}>
            <h1>Idea Whisper</h1>

            <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Your discussion topic to discuss along with others"
                maxLength={200}
                rows={5}
            />
            <div>{topic.length} / 200</div>

            <div className={styles_page.datePickerContainer}>
                <div className={styles_page.datePickerItem}>
                    <label>Voting Start Date</label>
                    <DatePicker
                        inline
                        dateFormat="dd/MM/yyyy"
                        showIcon
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        className={styles_page.datePicker}
                        selectsStart
                        minDate={new Date()}
                    />
                </div>

                <div className={styles_page.datePickerItem}>
                    <label>Voting End Date</label>
                    <DatePicker
                        inline
                        dateFormat="dd/MM/yyyy"
                        showIcon
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        className={styles_page.datePicker}
                        selectsEnd
                        minDate={new Date()}
                    />
                </div>
            </div>

            <div>
                <label>
                    <input type="checkbox" checked={allowVoteVisibility}
                           onChange={() => setAllowVoteVisibility(prev => !prev)}/>
                    Allow everyone to see the votes during voting
                </label>
            </div>

            <div>
                <label>
                    <input type="checkbox" checked={allowMultipleSelections}
                           onChange={() => setAllowMultipleSelections(prev => !prev)}/>
                    Allow multiple selections
                </label>
            </div>

            {allowMultipleSelections && (
                <div>
                    Maximum number of selections:
                    <input type="number" value={maxSelections} min={1}
                           onChange={(e) => setMaxSelections(Number(e.target.value))}/>
                </div>
            )}
            <br/>

            <button className={buttonStyles.button} onClick={handleSubmit}>Create Discussion</button>
            <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal}/>
        </div>
    );
}

export default PostCreation;