import React from 'react';
import Image from 'next/image';
import {useRouter} from "next/router";
import buttonStyles from '../styles/Button.module.css';

const IdeaWhisper: React.FC = () => {
    const router = useRouter();

    const handleButtonClick = () => {
        router.push('/post-creation');
    }

  return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>

          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
              <Image src="/whisper.png" alt="image" width={300} height={300} />
          </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '100px', marginBottom: '100px' }}>
              <h1>Idea Whisper</h1>
          </div>

          <div style={{ fontWeight: 600, fontSize: '24px', textAlign: 'center', marginBottom: '40px' }}>
            <i>Unleash Your Ideas Anonymously, Spark Engaging Conversations, <br/>and Empower the Best with Your Votes!</i>
          </div>

          <button className={buttonStyles.button} onClick={handleButtonClick}>
            Create Discussion
          </button>
        </div>

      </div>
  );
}

export default IdeaWhisper;
