import React, { useState, useEffect } from 'react';
import { QrCode, Users, Clock, Trophy, Share2, Check, Home, Plus, LogIn, User, Crown, Info, Youtube, Instagram, Camera } from 'lucide-react';
import { supabase } from './lib/supabase';

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
      </div>
      <p className="text-sm text-gray-600 mb-2">Join with code:</p>
      <p className="text-2xl font-bold text-gray-800">{gameCode}</p>
    </div>
  );
};

const PlayerList = ({ players, teams }) => {
  const teamColors = ['#FF6B9D', '#4ECDC4'];
  
  return (
    <div className="space-y-4">
      {teams && teams.map((teamName, teamIndex) => (
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
                {player.is_host && <Crown className="w-4 h-4 ml-2 text-yellow-500" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

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

// Main App Component
const InsaneInTheBrainGame = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [players, setPlayers] = useState([]);
  
  const navigateTo = (page) => {
    setCurrentPage(page);
  };
  
  const handleLogin = (userData) => {
    setUser(userData);
    navigateTo('home');
  };

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateTeamNames = () => {
    const adjectives = ['Sparkly', 'Bouncy', 'Fluffy', 'Giggling', 'Dancing', 'Flying', 'Sneaky', 'Magical'];
    const animals = ['Unicorns', 'Pandas', 'Dragons', 'Penguins', 'Llamas', 'Otters', 'Narwhals', 'Hedgehogs'];
    
    const team1 = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
    let team2 = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
    
    while (team1 === team2) {
      team2 = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
    }
    
    return [team1, team2];
  };

  // Subscribe to real-time player updates
  useEffect(() => {
    if (!currentGame?.id) return;

    const loadPlayers = async () => {
      console.log('Loading players for game:', currentGame.id);
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', currentGame.id)
        .order('created_at');
      
      console.log('Loaded players:', data);
      if (data) setPlayers(data);
    };

    loadPlayers();

    const channel = supabase
      .channel(`game:${currentGame.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${currentGame.id}` },
        (payload) => {
          console.log('Real-time update received:', payload);
          loadPlayers();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentGame?.id]);
  
  // Page Components
  const HomePage = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600">Multiplayer Fill-in-the-Blank Fun for Creative Minds</p>
      </div>
      
      {user && (
        <div className="bg-white p-4 rounded-lg border-2 border-gray-100 mb-6">
          <div className="flex items-center">
            {typeof user.avatar === 'string' && user.avatar.startsWith('data:') ? (
              <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full mr-3 object-cover" />
            ) : (
              <span className="text-2xl mr-3">{user.avatar}</span>
            )}
            <div>
              <h3 className="font-bold text-gray-800">{user.display_name}</h3>
              <p className="text-gray-600">{user.points || 0} points</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={() => {
            if (!user) {
              navigateTo('login');
            } else {
              navigateTo('create');
            }
          }}
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
          Join Game
        </button>
        
        <button
          onClick={() => navigateTo('leaderboard')}
          className="w-full bg-white text-gray-800 font-bold py-4 px-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center"
        >
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
          </button>
        )}
      </div>
      
      <Footer />
    </div>
  );
  
  const LoginPage = () => {
    const [displayName, setDisplayName] = useState('');
    const [avatar, setAvatar] = useState('🎨');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    
    const allEmojis = [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
      '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎺', '🎸', '🎹', '🥁', '🎤', '🎧', '🖌️', '🖍️', '✏️', '📝', '📚', '📖', '📰', '🗞️', '📄', '📃', '📑',
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
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (displayName.trim()) {
        const { data, error } = await supabase
          .from('users')
          .insert([{
            display_name: displayName,
            avatar: avatar === 'photo' ? uploadedPhoto : avatar,
            points: 0
          }])
          .select()
          .single();
        
        if (data) {
          handleLogin(data);
        }
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
              
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                  {avatar === 'photo' ? (
                    <img src={uploadedPhoto} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">{avatar}</span>
                  )}
                </div>
              </div>
              
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
    const [loading, setLoading] = useState(false);
    
    const handleCreateGame = async (e) => {
      e.preventDefault();
      if (!prompt.trim() || loading) return;
      
      setLoading(true);
      
      try {
        const code = generateGameCode();
        const [team1, team2] = generateTeamNames();
        
        const { data: game, error } = await supabase
          .from('games')
          .insert([{
            code: code,
            prompt: prompt,
            status: 'lobby',
            team1_name: team1,
            team2_name: team2
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        if (game && user) {
          const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
          
          await supabase
            .from('players')
            .insert([{
              game_id: game.id,
              user_id: user.id,
              name: user.display_name,
              team: 0,
              color: colors[0],
              is_host: true
            }]);
        }
        
        setCurrentGame(game);
        navigateTo('lobby');
      } catch (err) {
        console.error('Error creating game:', err);
        alert('Error creating game. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
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
              disabled={!prompt.trim() || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Game'}
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleJoinGame = async (e) => {
      e.preventDefault();
      if (!gameCode.trim() || !playerName.trim()) return;
      
      setLoading(true);
      setError('');
      
      try {
        const { data: game, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('code', gameCode.toUpperCase())
          .single();
        
        if (!game) {
          setError('Game not found. Check the code and try again.');
          setLoading(false);
          return;
        }
        
        const { data: existingPlayers } = await supabase
          .from('players')
          .select('team')
          .eq('game_id', game.id);
        
        const team0Count = existingPlayers?.filter(p => p.team === 0).length || 0;
        const team1Count = existingPlayers?.filter(p => p.team === 1).length || 0;
        const assignedTeam = team0Count <= team1Count ? 0 : 1;
        
        const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        const playerColor = colors[existingPlayers?.length % colors.length];
        
        await supabase
          .from('players')
          .insert([{
            game_id: game.id,
            name: playerName,
            team: assignedTeam,
            color: playerColor,
            is_host: false
          }]);
        
        setCurrentGame(game);
        navigateTo('lobby');
      } catch (err) {
        console.error('Error joining game:', err);
        setError('Error joining game. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Join a Game</h2>
        
        <div className="bg-white p-6 rounded-lg border-2 border-gray-100">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg">
                <p className="text-red-800 text-sm text-center">{error}</p>
              </div>
            )}
            
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
              disabled={!gameCode.trim() || !playerName.trim() || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  };
  
  const GameLobbyPage = () => {
    const currentPlayer = players.find(p => p.name === user?.display_name);
    const isHost = currentPlayer?.is_host || false;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Game Lobby</h2>
          <p className="text-gray-600">Prompt: <span className="font-bold">{currentGame?.prompt}</span></p>
          <p className="text-gray-600">Code: <span className="font-mono font-bold">{currentGame?.code}</span></p>
        </div>
        
        <QRCodeDisplay gameCode={currentGame?.code || ''} />
        
        <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
          <p className="text-yellow-800 text-center font-medium">
            {players.length} player{players.length !== 1 ? 's' : ''} joined • Waiting for more players...
          </p>
        </div>
        
        <PlayerList 
          players={players} 
          teams={[currentGame?.team1_name, currentGame?.team2_name]}
        />
        
        {isHost && (
          <button
            onClick={() => navigateTo('play')}
            disabled={players.length < 2}
            className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {players.length < 2 ? 'Need at least 2 players to start' : 'Start Game'}
          </button>
        )}
        
        {!isHost && (
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-blue-800 text-center">Waiting for host to start the game...</p>
          </div>
        )}
        
        <Footer />
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
      
      <Footer />
    </div>
  );
  
  const LeaderboardPage = () => {
    const [topPlayers, setTopPlayers] = useState([]);
    
    useEffect(() => {
      const loadLeaderboard = async () => {
        const { data } = await supabase
          .from('users')
          .select('*')
          .order('points', { ascending: false })
          .limit(10);
        
        if (data) setTopPlayers(data);
      };
      
      loadLeaderboard();
    }, []);
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Leaderboard</h2>
        
        <div className="bg-white rounded-lg border-2 border-gray-100 overflow-hidden">
          {topPlayers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No players yet. Be the first!
            </div>
          ) : (
            topPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center p-4 border-b border-gray-100 last:border-b-0">
                <span className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</span>
                <span className="text-2xl mx-3">{player.avatar}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{player.display_name}</h3>
                  <p className="text-gray-600">{player.points} points</p>
                </div>
                {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
              </div>
            ))
          )}
        </div>
        
        <Footer />
      </div>
    );
  };
  
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'login': return <LoginPage />;
      case 'create': return <CreateGamePage />;
      case 'join': return <JoinGamePage />;
      case 'lobby': return <GameLobbyPage />;
      case 'about': return <AboutPage />;
      case 'leaderboard': return <LeaderboardPage />;
      default: return <HomePage />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <div className="max-w-md mx-auto p-4">
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
        </div>
        
        <main>
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default InsaneInTheBrainGame;