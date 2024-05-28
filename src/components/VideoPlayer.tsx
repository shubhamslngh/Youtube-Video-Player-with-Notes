import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

const Home = () => {
  const [videoId, setVideoId] = useState('M7lc1UVf-VE');
  const [notes, setNotes] = useState<any[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [editNoteId, setEditNoteId] = useState<number | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  useEffect(() => {
    if (videoId) {
      const savedNotes = localStorage.getItem(`notes-${videoId}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        setNotes([]);
      }

      // Fetch video details
      axios
        .get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${API_KEY}`)
        .then(response => {
          const videoDetails = response.data.items[0].snippet;
          setVideoTitle(videoDetails.title);
          setVideoDescription(videoDetails.description);
        })
        .catch(error => {
          console.error('Error fetching video details:', error);
        });
    }
  }, [videoId]);

  const onReady = (event: YouTubePlayer) => {
    setPlayer(event.target);
  };

  const saveNote = () => {
    if (currentNote.trim() && player) {
      const currentTime = player.getCurrentTime();
      const newNote = {
        id: Date.now(),
        time: currentTime,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        note: currentNote,
        image: image,
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem(`notes-${videoId}`, JSON.stringify(updatedNotes));
      setCurrentNote('');
      setImage(null);
      setShowEditor(false);
    }
  };

  const updateNote = () => {
    if (currentNote.trim() && editNoteId) {
      const updatedNotes = notes.map(note =>
        note.id === editNoteId ? { ...note, note: currentNote, image: image } : note
      );
      setNotes(updatedNotes);
      localStorage.setItem(`notes-${videoId}`, JSON.stringify(updatedNotes));
      setCurrentNote('');
      setEditNoteId(null);
      setImage(null);
      setShowEditor(false);
    }
  };

  const deleteNote = (id: number) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem(`notes-${videoId}`, JSON.stringify(updatedNotes));
  };

  const editNote = (note: any) => {
    setCurrentNote(note.note);
    setEditNoteId(note.id);
    setImage(note.image);
    setShowEditor(true);
  };

  const jumpToTime = (time: number) => {
    if (player) {
      player.seekTo(time);
    }
  };

  const handleVideoUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch) {
      setVideoId(videoIdMatch[1]);
    } else {
      setVideoId('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col mx-auto p-5">
      <div className="mx-auto mb-5">
        <input
          type="text"
          placeholder="Enter YouTube video URL"
          onChange={handleVideoUrlChange}
          className="w-full p-2 mb-3 border items-center border-gray-300 rounded"
        />
        {videoId && (
          <div className='mx-auto p-4'>
            <YouTube videoId={videoId} onReady={onReady} className="w-full place-items-center items-center mx-auto" />
          </div>
        )}
      </div>
      {videoId && (
        <div className="w-full shadow-lg backdrop-blur-md mx-auto mb-5">
          <h2 className="text-2xl backdrop-blur-md drop-shadow-xl

 font-semibold mb-2">Title: {videoTitle}</h2>
          <p className="text-[10px] drop-shadow-sm 
 text-gray-600">Description: {videoDescription}</p>
        </div>
      )}
     <div className="w-full mx-auto mb-5 p-4 border rounded-lg shadow-sm">
  <div className="flex w-full justify-between items-center mb-4">
    <div className=' grid space-x-4 mx-auto p-4 border-b-2 w-full'>
      <h2 className=" text-sm font-bold">My notes</h2>
      <p className=" text-sm text-gray-600">All your notes at a single place. Click on any note to go to a specific timestamp in the video.</p>
    </div>
    <button
      onClick={() => setShowEditor(true)}
      className="flex-none bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-5 border border-gray-400 rounded shadow text-xs"
    >
      <span className='mr-1'>⨁</span> Add new note
    </button>
  </div>

        {showEditor && (
          <div className="w-full mx-auto">
            <ReactQuill
              value={currentNote}
              onChange={setCurrentNote}
              placeholder="Write your note here..."
              className="mb-3 rounded-md"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-3 rounded-md"
            />
            {image && <img src={image} alt="Uploaded" className="mb-3 max-w-full h-auto" />}
            {editNoteId ? (
              <button onClick={updateNote} className="px-3 py-1 mb-5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">
                Update Note
              </button>
            ) : (
              <button onClick={saveNote} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-xs">
                Save Note
              </button>
            )}
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="mb-4 p-4 border rounded-lg shadow-sm">
            <div className="grid justify-between items-center mb-2">
              <span className="text-gray-500 text-xs">{note.date}</span>
              <span onClick={() => jumpToTime(note.time)} className="text-blue-500 cursor-pointer text-xs">
                Timestamp: {new Date(note.time * 1000).toISOString().substr(14, 5)} min
              </span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: note.note }}></div>
            {note.image && <img src={note.image} alt="Note" className="mt-2 max-w-xs h-auto" />}
            <div className="flex justify-end mr-2 mt-2">
              <button onClick={() => deleteNote(note.id)} className="bg-white text-sm hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-xs">
                Delete note
              </button>
              <button onClick={() => editNote(note)} className="bg-white text-sm hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-xs">
                Edit note
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
