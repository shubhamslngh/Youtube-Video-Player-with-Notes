import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import YouTube from 'react-youtube';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Home = () => {
  const [videoId, setVideoId] = useState('M7lc1UVf-VE');
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [editNoteId, setEditNoteId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [image, setImage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (videoId) {
      const savedNotes = localStorage.getItem(`notes-${videoId}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        setNotes([]);
      }
    }
  }, [videoId]);

  const onReady = (event) => {
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

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem(`notes-${videoId}`, JSON.stringify(updatedNotes));
  };

  const editNote = (note) => {
    setCurrentNote(note.note);
    setEditNoteId(note.id);
    setImage(note.image);
    setShowEditor(true);
  };

  const jumpToTime = (time) => {
    if (player) {
      player.seekTo(time);
    }
  };

  const handleVideoUrlChange = (event) => {
    const url = event.target.value;
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch) {
      setVideoId(videoIdMatch[1]);
    } else {
      setVideoId('');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
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
      <div className="w-full border-b-2 mx-auto mb-5">
        <h2 className="text-xl font-semibold mb-2">Video title goes here</h2>
        <p className="text-gray-600">This is the description of the video</p>
      </div>
      <div className="w-full mx-auto mb-5 p-4 border rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className='mx-auto border-b-2 w-full'>
            <h2 className="text-sm font-bold">My notes</h2>
            <p className="text-sm text-gray-600">All your notes at a single place. Click on any note to go to specific timestamp in the video.</p>
          </div>
          <button onClick={() => setShowEditor(true)} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
            ⨁ Add new note
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
              <button onClick={updateNote} className="px-4 py-2 mb-5 bg-blue-500 text-white rounded hover:bg-blue-600">
                Update Note
              </button>
            ) : (
              <button onClick={saveNote} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
                Save Note
              </button>
            )}
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="mb-4 p-4 border rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">{note.date}</span>
              <span onClick={() => jumpToTime(note.time)} className="text-blue-500 cursor-pointer">
                Timestamp: {new Date(note.time * 1000).toISOString().substr(14, 5)} min
              </span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: note.note }}></div>
            {note.image && <img src={note.image} alt="Note" className="mt-2 max-w-xs h-auto" />}
            <div className="flex justify-end mr-2 mt-2">
              <button onClick={() => deleteNote(note.id)} className="bg-white text-sm hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
                Delete note
              </button>
              <button onClick={() => editNote(note)} className="bg-white text-sm hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
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
