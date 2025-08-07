import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function PlayerProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (userErr) console.error('User fetch error:', userErr);
      setUser(userData);

      const { data: gameData, error: gameErr } = await supabase
        .from('players')
        .select('*, games(*)')
        .eq('user_id', id);
      if (gameErr) console.error('Games fetch error:', gameErr);
      setGames(gameData);
    }
    fetchData();
  }, [id]);

  if (!user) return <p className="text-center mt-10">Loading profile…</p>;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-2 text-center">{user.avatar} {user.display_name}</h1>
      <p className="text-center text-gray-500 mb-6">{user.points ?? 0} points</p>
      <h2 className="font-bold text-lg mb-2">Recent Games</h2>
      <ul className="space-y-2">
        {games.map((g, i) => (
          <li key={i} className="border p-2 rounded">
            <div className="text-sm text-gray-700">Game: {g.games?.prompt ?? 'Unknown'}</div>
            <div className="text-xs text-gray-500">Played on: {g.games?.created_at ? new Date(g.games.created_at).toLocaleString() : 'N/A'}</div>
            <div className="text-xs">Role: {g.is_host ? 'Host' : 'Player'}{g.winner ? ' 🏆 Winner' : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
