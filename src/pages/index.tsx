import React from 'react';
import VideoPlayer from '../components/VideoPlayer';

const Home: React.FC = () => {
  return (
    <div className="container  bg-white mx-auto p-5">
      <h1 className="text-2xl font-bold text-left mb-8"> Video Player with Notes</h1>
      <div className='p-0 mx-auto w-full h-full'>
        <VideoPlayer />
        </div>
    </div>
  );
};

export default Home;
