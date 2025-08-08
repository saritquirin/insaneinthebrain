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

const QRCodeDisplay = ({ gameCode }) => (
  <div className="bg-white p-6 rounded-lg border-2 border-gray-200 text-center">
    <div className="w-32 h-32 bg-gray-100 mx-auto mb-4 rounded-lg flex items-center justify-center">
      <QrCode className="w-16 h-16 text-gray-400" />
      <span className="ml-2 text-sm text-gray-500">QR Code</span>
    </div>
    <p className="text-sm text-gray-600 mb-2">Join with code:</p>
    <p className="text-2xl font-bold text-gray-800">{gameCode}</p>
  </div>
);

const PlayerList = ({ players, currentUserId }) => {
  const teamColors = ['#FF6B9D', '#4ECDC4'];
  const game = mockGames[0];

  return (
    <div className="space-y-4">
      {game.teams.map((teamName, teamIndex) => (
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

  // Example segments for demo
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
            onChange={(e) => setAnswers({ ...answers, [segment.id]: e.target.value })}
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

  // Example completed story using contributions
  const mockStory = `Once upon a time, there was a ${playerContributions?.noun || 'dragon'} who was incredibly ${playerContributions?.adjective || 'magnificent'}. Every morning, it would ${playerContributions?.verb || 'fly'} across the land, making ${playerContributions?.whoosh || 'whoosh noises'} everywhere!`;

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
        // User cancelled share
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
        <p className="text-gray-800 leading-relaxed font-serif">{mockStory}</p>
      </div>
    </div>
  );
};

const VoteButton = ({ segmentId, playerId, onVote, hasVoted }) => (
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
        <a
          href="https://bsky.app/profile/insaneinthebrain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-500 transition-colors"
        >
          <div className="w-6 h-6 bg-current rounded-full"></div>
        </a>
        <a
          href="https://substack.com/@insaneinthebrain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-orange-500 transition-colors"
        >
          <div className="w-6 h-6 bg-current rounded-sm"></div>
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Insane In The Brain Game</h1>
      <Footer />
    </div>
  );
};

export default InsaneInTheBrainGame;
