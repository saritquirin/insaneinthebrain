import React, { useState, useEffect } from 'react';
import { QrCode, Users, Clock, Trophy, Share2, Copy, Check, Home, Plus, LogIn, User, Crown, Info, Youtube, Instagram, Camera, Upload } from 'lucide-react';

// Mock data for demonstration
const mockUsers = [
  { id: '1', display_name: 'Alice', avatar: '🎨', points: 150 },
  { id: '2', display_name: 'Bob', avatar: '🎭', points: 120 },
  { id: '3', display_name: 'Charlie', avatar: '🎪', points: 95 }
];

const mockGames = [
  {
    id: 'game123',
    prompt: 'dragons',
    teams: ['Sparkly Unicorns', 'Bouncy Pandas'],
    players: [
      { id: '1', name: 'Alice', team: 0, color: '#FF6B9D', isHost: true },
      { id: '2', name: 'Bob', team: 1, color: '#4ECDC4' },
      { id: '3', name: 'Charlie', team: 0, color: '#45B7D1' }
    ]
  }
];

// Utility Components
const GameTimer = ({ timeLeft, onTimeUp }) => {
  const [time, setTime] = useState(timeLeft);
  
  useEffect(() => {
    if (time <= 0) {
      onTimeUp();
      return;
    }
    
    const timer = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(timer);
  }, [time, onTimeUp]);
  
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  
  return (
    <div className="flex items-center justify-center bg-gradient-to-r from-pink-100 to-blue-100 p-4 rounded-lg mb-6">
      <Clock className="w-6 h-6 mr-2 text-gray-600" />
      <span className="text-2xl font-bold text-gray-800">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

const QRCodeDisplay = ({ gameCode }) => {
  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 text-center">
      <div className="w-32 h-32 bg-gray-100 mx-auto mb-4 rounded-lg flex items-center justify-center">
        <QrCode className="w-16 h-16 text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">QR Code</span>
      </div>
      <p className="text-sm text-gray-600 mb-2">Join with code:</p>
      <p className="text-2xl font-bold text-gray-800">{gameCode}</p>
    </div>
  );
};

const PlayerList = ({ players, currentUserId }) => {
  const teamColors = ['#FF6B9D', '#4ECDC4'];
  
  return (
    <div className="space-y-4">
      {mockGames[0].teams.map((teamName, teamIndex) => (
        <div key={teamIndex} className="bg-white rounded-lg p-4 border-2 border-gray-100">
          <h3 className="font-bold text-lg mb-3 text-gray-800" style={{ color: teamColors[teamIndex] }}>
            {teamName}
          </h3>
          <div className="space-y-2">
            {players.filter(p => p.team === teamIndex).map(player => (
              <div key={player.id} className="flex items-center p-2 rounded-lg bg-gray-50">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: player.color }}
                ></div>
                <span className="font-medium text-gray-800">{player.name}</span>
                {player.isHost && <Crown className="w-4 h-4 ml-2 text-yellow-500" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const MadLibsForm = ({ segments, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  
  const mockSegments = [
    { id: 1, prompt: 'noun', placeholder: 'e.g., banana' },
    { id: 2, prompt: 'adjective', placeholder: 'e.g., sparkly' },
    { id: 3, prompt: 'verb', placeholder: 'e.g., dancing' },
    { id: 4, prompt: 'something that goes whoosh', placeholder: 'e.g., wind' }
  ];
  
  const handleSubmit = () => {
    if (showConfirm) {
      onSubmit(answers);
    } else {
      setShowConfirm(true);
    }
  };
  
  return (
    <div className="space-y-4">
      {mockSegments.map(segment => (
        <div key={segment.id} className="bg-white p-4 rounded-lg border-2 border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {segment.prompt}
          </label>
          <input
            type="text"
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-300 focus:outline-none"
            placeholder={segment.placeholder}
            value={answers[segment.id] || ''}
            onChange={(e) => setAnswers({...answers, [segment.id]: e.target.value})}
          />
        </div>
      ))}
      
      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all"
      >
        {showConfirm ? 'Yes, Submit!' : 'Submit Answers'}
      </button>
      
      {showConfirm && (
        <button
          onClick={() => setShowConfirm(false)}
          className="w-full bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg hover:bg-gray-400 transition-all"
        >
          Wait, let me double-check...
        </button>
      )}
    </div>
  );
};

const StoryRevealCard = ({ teamName, story, playerContributions }) => {
  const [copied, setCopied] = useState(false);
  
  const mockStory = `Once upon a time, there was a ${playerContributions?.noun || 'dragon'} who was incredibly ${playerContributions?.adjective || 'magnificent'}. Every morning, it would ${playerContributions?.verb || 'soar'} through the clouds while ${playerContributions?.whoosh || 'wind'} rushed past its wings. The end.`;
  
  const handleShare = async () => {
    const shareData = {
      title: `${teamName} Story`,
      text: mockStory,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(mockStory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-100 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{teamName}</h3>
        <button
          onClick={handleShare}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
        </button>
      </div>
      <div className="prose prose-lg">
        <p className="text-gray-800 leading-relaxed font-serif">
          {mockStory}
        </p>
      </div>
    </div>
  );
};

const VoteButton = ({ segmentId, playerId, onVote, hasVoted }) => {
  return (
    <button
      onClick={() => onVote(segmentId, playerId)}
      disabled={hasVoted}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        hasVoted 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:from-pink-600 hover:to-blue-600'
      }`}
    >
      {hasVoted ? 'Voted!' : 'Vote for this!'}
    </button>
  );
};

// Main App Component
const InsaneInTheBrainGame = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [hasVoted, setHasVoted] = useState(false);
  
  // Navigation function
  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (data) setGameState(data);
  };
  
  // Mock login
  const handleLogin = (userData) => {
    setUser(userData);
    navigateTo('home');
  };
  
  // Footer Component
  const Footer = () => (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <p className="text-center text-sm text-gray-600 mb-4">Follow us for updates!</p>
      <div className="flex justify-center space-x-4">
        <a href="https://youtube.com/@insaneinthebrain" target="_blank" rel="noopener noreferrer" 
           className="text-gray-400 hover:text-red-500 transition-colors">
          <Youtube className="w-6 h-6" />
        </a>
        <a href="https://instagram.com/insaneinthebrain" target="_blank" rel="noopener noreferrer"
           className="text-gray-400 hover:text-pink-500 transition-colors">
          <Instagram className="w-6 h-6" />
        </a>
        <a href="https://tiktok.com/@insaneinthebrain" target="_blank" rel="noopener noreferrer"
           className="text-gray-400 hover:text-black transition-colors">
          <div className="w-6 h-6 bg-current rounded-sm"></div>
        </a>
        <a href="https://bsky.app/profile/insaneinthebrain" target="_blank" rel="noopener noreferrer"
           className="text-gray-400 hover:text-blue-500 transition-colors">
          <div className="w-6 h-6 bg-current rounded-full"></div>
        </a>
        <a href="https://substack.com/@insaneinthebrain" target="_blank" rel="noopener noreferrer"
           className="text-gray-400 hover:text-orange-500 transition-colors">
          <div className="w-6 h-6 bg-current rounded"></div>
        </a>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">@insaneinthebrain</p>
    </div>
  );
  const HomePage = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
            )}
            <div>
              <h3 className="font-bold text-gray-800">{user.display_name}</h3>
        </div>
      ) : null}
      
      <div className="space-y-4">
        <button
          onClick={() => navigateTo('create')}
          className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-4 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Game
        </button>
        
        <button
          onClick={() => navigateTo('join')}
          className="w-full bg-white text-gray-800 font-bold py-4 px-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center"
        >
          <Users className="w-5 h-5 mr-2" />
           </button>

        <button
          onClick={() => navigateTo('leaderboard')}
          className="w-full bg-white text-gray-800 font-bold py-4 px-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Leaderboard
        </button>
          <Trophy className="w-5 h-5 mr-2" />
          Leaderboard
        </button>
        
        <button
          onClick={() => navigateTo('about')}
          className="w-full bg-white text-gray-800 font-bold py-4 px-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center"
        >
          <Info className="w-5 h-5 mr-2" />
          About
        </button>
        
        {!user && (
          <button
            onClick={() => navigateTo('login')}
            className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
        <p className="text-gray-600">Multiplayer Fill-in-the-Blank Fun for Creative Minds</p>
            ) : (
              <span className="text-2xl mr-3">{user.avatar}</span>
          </button>
        )}
      </div>
      
      {/* Social Links */}
      <div className="mt-8 pt-6 border-t border-gray-200">
      </div>
      
              <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full mr-3 object-cover" />
        <p className="text-center text-sm text-gray-600 mb-4">Follow us for updates!</p>
        <div className="flex justify-center space-x-4">
          <a href="https://youtube.com/@insaneinthebrain" target="_blank" rel="noopener noreferrer" 
             className="text-gray-400 hover:text-red-500 transition-colors">
            <Youtube className="w-6 h-6" />
          </a>
          <a href="https://instagram.com/insaneinthebrain" target="_blank" rel="noopener noreferrer"
             className="text-gray-400 hover:text-pink-500 transition-colors">
            <Instagram className="w-6 h-6" />
      {user ? (
        <div className="bg-white p-4 rounded-lg border-2 border-gray-100 mb-6">
          <div className="flex items-center">
          </a>
          <a href="https://tiktok.com/@insaneinthebrain" target="_blank" rel="noopener noreferrer"
             className="text-gray-400 hover:text-black transition-colors">
            <div className="w-6 h-6 bg-current rounded-sm"></div>
          </a>
          <a href="https://bsky.app/profile/insaneinthebrain" target="_blank" rel="noopener noreferrer"

             className="text-gray-400 hover:text-blue-500 transition-colors">
            <div className="w-6 h-6 bg-current rounded-full"></div>
          </a>
          <a href="https://substack.com/@insaneinthebrain" target="_blank" rel="noopener noreferrer"
             className="text-gray-400 hover:text-orange-500 transition-colors">
            <div className="w-6 h-6 bg-current rounded"></div>
          </a>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">@insaneinthebrain</p>
      </div>
    </div>
  );
  
  const LoginPage = () => {
    const [displayName, setDisplayName] = useState('');
    const [avatar, setAvatar] = useState('🎨');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    
    const allEmojis = [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
      '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎺', '🎸', '🎹', '🥁', '🎤', '🎧', '🎨', '🖌️', '🖍️', '✏️', '📝', '📚', '📖', '📰', '🗞️', '📄', '📃', '📑',
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗'
    ];
    
    const handlePhotoUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedPhoto(e.target.result);
          setAvatar('photo');
        };
        reader.readAsDataURL(file);
      }
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (displayName.trim()) {
        handleLogin({
          id: Date.now().toString(),
          display_name: displayName,
          avatar: avatar === 'photo' ? uploadedPhoto : avatar,
          points: 0
        });
      }
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Join the Fun!</h2>
        
        <div className="bg-white p-6 rounded-lg border-2 border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-300 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pick Your Avatar</label>
              
              {/* Current Avatar Display */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                  {avatar === 'photo' ? (
                    <img src={uploadedPhoto} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">{avatar}</span>
                  )}
                </div>
              </div>
              
              {/* Avatar Options */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-all">
                      <Camera className="w-5 h-5 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-700">Upload Photo</span>
                    </div>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all"
                  >
                    <span className="text-lg">😊</span>
                  </button>
                </div>
                
                {showEmojiPicker && (
                  <div className="max-h-32 overflow-y-auto border-2 border-gray-200 rounded-lg p-2">
                    <div className="grid grid-cols-8 gap-1">
                      {allEmojis.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setAvatar(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className={`p-2 text-lg rounded hover:bg-gray-100 transition-all ${
                            avatar === emoji ? 'bg-pink-100 border border-pink-300' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!displayName.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Let's Play!
            </button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  };
  
  const CreateGamePage = () => {
    const [prompt, setPrompt] = useState('');
    const [gameCreated, setGameCreated] = useState(false);
    const [gameCode, setGameCode] = useState('');
    
    const handleCreateGame = (e) => {
      e.preventDefault();
      if (prompt.trim()) {
        const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setGameCode(newGameCode);
        setGameCreated(true);
        
        // Mock game creation
        const gameData = {
          id: newGameCode.toLowerCase(),
          prompt: prompt,
          code: newGameCode,
          players: user ? [{ ...user, isHost: true, team: 0, color: '#FF6B9D' }] : []
        };
        setGameState(gameData);
      }
    };
    
    if (gameCreated) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Game Created!</h2>
          <p className="text-center text-gray-600">Prompt: <span className="font-bold">{prompt}</span></p>
          
          <QRCodeDisplay gameCode={gameCode} />
          
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              Share this link: <span className="font-mono">insane-brain.com/join/{gameCode}</span>
            </p>
          </div>
          
          <button
            onClick={() => navigateTo('lobby', gameState)}
            className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all"
          >
            Go to Game Lobby
          </button>
          
          <Footer />
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Create a Game</h2>
        
        <div className="bg-white p-6 rounded-lg border-2 border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter a single word prompt
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-300 focus:outline-none text-center text-lg"
                placeholder="e.g., dragons, pizza, robots..."
                maxLength={20}
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                This word will inspire two unique stories for your teams to complete!
              </p>
            </div>
            
            <button
              onClick={handleCreateGame}
              disabled={!prompt.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Game
            </button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  };
  
  const JoinGamePage = () => {
    const [gameCode, setGameCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    
    const handleJoinGame = (e) => {
      e.preventDefault();
      if (gameCode.trim() && playerName.trim()) {
        // Mock joining game
        navigateTo('lobby', {
          id: gameCode.toLowerCase(),
          code: gameCode.toUpperCase(),
          players: [
            ...mockGames[0].players,
            { 
              id: Date.now().toString(), 
              name: playerName, 
              team: Math.floor(Math.random() * 2), 
              color: '#95E1D3',
              isHost: false 
            }
          ]
        });
      }
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Join a Game</h2>
        
        <div className="bg-white p-6 rounded-lg border-2 border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Game Code</label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-300 focus:outline-none text-center text-lg font-mono"
                placeholder="ABC123"
                maxLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-300 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>
            
            <button
              onClick={handleJoinGame}
              disabled={!gameCode.trim() || !playerName.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Game
            </button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  };
  
  const GameLobbyPage = () => {
    const isHost = gameState?.players?.find(p => p.id === user?.id)?.isHost || false;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Game Lobby</h2>
          <p className="text-gray-600">Prompt: <span className="font-bold">{gameState?.prompt || 'dragons'}</span></p>
          <p className="text-gray-600">Code: <span className="font-mono font-bold">{gameState?.code || 'GAME123'}</span></p>
        </div>
        
        <PlayerList players={mockGames[0].players} currentUserId={user?.id} />
        
        {isHost && (
          <button
            onClick={() => navigateTo('play')}
            className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all"
          >
            Start Game
          </button>
        )}
        
        {!isHost && (
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
            <p className="text-yellow-800 text-center">Waiting for host to start the game...</p>
          </div>
        )}
        
        {/* Demo Navigation */}
        <div className="border-t-2 border-dashed border-gray-300 pt-4">
          <p className="text-sm text-gray-500 text-center mb-3">Demo Navigation:</p>
          <button
            onClick={() => navigateTo('play')}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm"
          >
            Go to Game Page (Demo)
          </button>
        </div>
      </div>
    );
  };
  
  const PlayGamePage = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Fill in the Blanks!</h2>
        
        <GameTimer 
          timeLeft={timeLeft} 
          onTimeUp={() => navigateTo('results')} 
        />
        
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <p className="text-blue-800 text-center text-sm">
            Fill in each blank to make the story as funny as possible! You won't see the context until the big reveal.
          </p>
        </div>
        
        <MadLibsForm 
          segments={[]}
          onSubmit={() => navigateTo('results')}
        />
        
        {/* Demo Navigation Buttons */}
        <div className="border-t-2 border-dashed border-gray-300 pt-4">
          <p className="text-sm text-gray-500 text-center mb-3">Demo Navigation:</p>
          <div className="space-y-2">
            <button
              onClick={() => navigateTo('results')}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm"
            >
              Skip to Results Page
            </button>
            <button
              onClick={() => setTimeLeft(5)}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm"
            >
              Set Timer to 5 Seconds
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const GameResultsPage = () => {
    const mockContributions = {
      noun: 'banana',
      adjective: 'sparkly',
      verb: 'dancing',
      whoosh: 'kazoo sounds'
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">The Big Reveal!</h2>
        
        <StoryRevealCard 
          teamName="Sparkly Unicorns" 
          story="" 
          playerContributions={mockContributions}
        />
        
        <StoryRevealCard 
          teamName="Bouncy Pandas" 
          story="" 
          playerContributions={{}}
        />
        
        <div className="bg-white p-6 rounded-lg border-2 border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Vote for the Funniest!</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">Alice's "banana"</span>
              <VoteButton 
                segmentId="1" 
                playerId="1" 
                onVote={() => setHasVoted(true)}
                hasVoted={hasVoted}
              />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">Bob's "sparkly"</span>
              <VoteButton 
                segmentId="2" 
                playerId="2" 
                onVote={() => setHasVoted(true)}
                hasVoted={hasVoted}
              />
            </div>
          </div>
        </div>
        
        <button
          onClick={() => navigateTo('home')}
          className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all"
        >
          Play Again
        </button>
      </div>
    );
  };
  
  const AboutPage = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">About the Game</h2>
      
      <div className="bg-white p-6 rounded-lg border-2 border-gray-100 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">How It Works</h3>
          <p className="text-gray-600 leading-relaxed">
            Here's the deal: you and your friends are going to create absolutely ridiculous stories together. 
            One of you throws out a random word (like "tacos" or "unicorns"), and boom - the app generates 
            two mysterious stories that need your help to come alive. You'll fill in blanks without knowing 
            what you're writing about, then laugh until your sides hurt when everything gets revealed!
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Perfect When You Need</h3>
          <ul className="text-gray-600 space-y-1">
            <li>• An icebreaker that actually breaks the ice</li>
            <li>• Something hilarious for your next party</li>
            <li>• A way to get your family laughing together</li>
            <li>• Team building that doesn't feel like work</li>
            <li>• Entertainment for literally any group size</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">What Makes It Awesome</h3>
          <ul className="text-gray-600 space-y-1">
            <li>• Works on everyone's phone - no downloads needed</li>
            <li>• AI creates fresh stories every single time</li>
            <li>• You can play with 2 people or 200 people</li>
            <li>• Vote for the funniest contributions</li>
            <li>• Share the ridiculous results with everyone</li>
            <li>• Track your comedy wins on the leaderboard</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Why We Made This</h3>
          <p className="text-gray-600 leading-relaxed">
            Because the world needs more laughter, and the best kind happens when you're creating something 
            silly with people you care about. Whether you're meeting strangers at a meetup or hanging with 
            your oldest friends, this game turns any group into a comedy writing team. Ready to get weird?
          </p>
        </div>
      </div>
    </div>
  );
  
  const LeaderboardPage = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Leaderboard</h2>
      
      <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
        {mockUsers.map((user, index) => (
          <div key={user.id} className="flex items-center p-4 border-b border-gray-100 last:border-b-0">
            <span className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</span>
            <span className="text-2xl mx-3">{user.avatar}</span>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{user.display_name}</h3>
              <p className="text-gray-600">{user.points} points</p>
            </div>
            {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
          </div>
        ))}
      </div>
    </div>
  );
  
  // Render current page
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'login': return <LoginPage />;
      case 'create': return <CreateGamePage />;
      case 'join': return <JoinGamePage />;
      case 'lobby': return <GameLobbyPage />;
      case 'play': return <PlayGamePage />;
      case 'results': return <GameResultsPage />;
      case 'about': return <AboutPage />;
      case 'leaderboard': return <LeaderboardPage />;
      default: return <HomePage />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 
            onClick={() => navigateTo('home')}
            className="text-2xl font-bold text-gray-800 font-serif cursor-pointer"
          >
            Insane in the Brain
          </h1>
          
          {currentPage !== 'home' && (
            <button 
              onClick={() => navigateTo('home')}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home className="w-6 h-6" />
            </button>
          )}
          
          {user && currentPage === 'home' && (
            <button 
              onClick={() => navigateTo('profile')}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <User className="w-6 h-6" />
            </button>
          )}
        </div>
        
        {/* Main Content */}
        <main>
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default InsaneInTheBrainGame;
