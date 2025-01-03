import React, { useState, useEffect } from 'react';
import { AlertCircle, PlusCircle, Trash2, Trophy, TrendingUp, Award } from 'lucide-react';

const FiveCrownsScorekeeper = () => {
  // Possible wild cards for Five Crowns
  const WILD_CARDS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // State for players
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  // State for game tracking
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentWildCard, setCurrentWildCard] = useState('3');
  const [currentDealer, setCurrentDealer] = useState(null);
  
  // Modal visibility states
  const [isAddPlayerModalVisible, setIsAddPlayerModalVisible] = useState(false);
  const [isEnterScoresModalVisible, setIsEnterScoresModalVisible] = useState(false);
  const [isGameOverModalVisible, setIsGameOverModalVisible] = useState(false);
  
  // Temporary scores for current round
  const [currentRoundScores, setCurrentRoundScores] = useState({});

  // New state for statistics
  const [playerStats, setPlayerStats] = useState({});
  const [achievements, setAchievements] = useState({});

  // Add a new player
  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Math.random().toString(),
        name: newPlayerName.trim(),
        totalScore: 0
      };
      setPlayers([...players, newPlayer]);
      
      // If this is the first player, make them the dealer
      if (players.length === 0) {
        setCurrentDealer(newPlayer);
      }
      
      setNewPlayerName('');
      setIsAddPlayerModalVisible(false);

      // Initialize stats for new player
      setPlayerStats(prev => ({
        ...prev,
        [newPlayer.id]: {
          avgScore: 0,
          bestRound: Infinity,
          worstRound: -1,
          lowStreak: 0,
          highStreak: 0,
          currentLowStreak: 0,
          currentHighStreak: 0,
          perfectRounds: 0
        }
      }));

      setAchievements(prev => ({
        ...prev,
        [newPlayer.id]: []
      }));
    }
  };

  // Remove a player
  const removePlayer = (playerId) => {
    setPlayers(players.filter(player => player.id !== playerId));
  };

  // Reset the entire game
  const resetGame = () => {
    setPlayers([]);
    setRounds([]);
    setCurrentRound(1);
    setCurrentWildCard('3');
    setCurrentDealer(null);
    setIsGameOverModalVisible(false);
  };

  // Start entering scores for the current round
  const beginRoundScoring = () => {
    // Initialize scores as empty strings for each player
    const initialScores = players.reduce((acc, player) => {
      acc[player.id] = '';
      return acc;
    }, {});
    setCurrentRoundScores(initialScores);
    setIsEnterScoresModalVisible(true);
  };

  // Update score for a specific player
  const updatePlayerScore = (playerId, score) => {
    setCurrentRoundScores(prev => ({
      ...prev,
      [playerId]: score
    }));
  };

  // Calculate statistics after each round
  const updatePlayerStats = (roundScores) => {
    const newStats = { ...playerStats };
    
    roundScores.forEach(score => {
      const playerRounds = rounds.filter(r => 
        r.scores.find(s => s.id === score.id)
      );
      
      const stats = newStats[score.id];
      const roundScore = score.roundScore;
      
      // Update averages - ensure it's always a number
      const sumOfScores = playerRounds.reduce((sum, r) => 
        sum + r.scores.find(s => s.id === score.id).roundScore, 0
      );
      stats.avgScore = playerRounds.length > 0 ? sumOfScores / playerRounds.length : 0;

      // Ensure avgScore is a number
      if (isNaN(stats.avgScore)) {
        stats.avgScore = 0;
      }

      // Update best/worst rounds
      stats.bestRound = Math.min(stats.bestRound, roundScore);
      stats.worstRound = Math.max(stats.worstRound, roundScore);

      // Update streaks
      const isLowest = Math.min(...roundScores.map(s => s.roundScore)) === roundScore;
      const isHighest = Math.max(...roundScores.map(s => s.roundScore)) === roundScore;

      stats.currentLowStreak = isLowest ? stats.currentLowStreak + 1 : 0;
      stats.currentHighStreak = isHighest ? stats.currentHighStreak + 1 : 0;
      stats.lowStreak = Math.max(stats.lowStreak, stats.currentLowStreak);
      stats.highStreak = Math.max(stats.highStreak, stats.currentHighStreak);

      // Check for achievements
      const newAchievements = [];
      if (roundScore === 0) {
        stats.perfectRounds++;
        newAchievements.push('Perfect Round');
      }
      if (stats.currentLowStreak === 3) newAchievements.push('Hot Streak');
      if (stats.avgScore < 10) newAchievements.push('Consistency King');

      if (newAchievements.length > 0) {
        setAchievements(prev => ({
          ...prev,
          [score.id]: [...new Set([...prev[score.id], ...newAchievements])]
        }));
      }
    });

    setPlayerStats(newStats);
  };

  // Predict final rankings
  const predictFinalRankings = () => {
    if (rounds.length < 3) return null;

    return players.map(player => {
      const recentScores = rounds.slice(-3).map(round => 
        round.scores.find(s => s.id === player.id).roundScore
      );
      const trend = recentScores.reduce((a, b) => a + b, 0) / 3;
      const remainingRounds = WILD_CARDS.length - currentRound;
      const predictedFinal = player.totalScore + (trend * remainingRounds);
      
      return {
        name: player.name,
        predictedScore: Math.round(predictedFinal)
      };
    }).sort((a, b) => a.predictedScore - b.predictedScore);
  };

  // Finalize round scores
  const finishRound = () => {
    // Convert scores to numbers and validate, treating empty strings as 0
    const processedScores = players.map(player => ({
      ...player,
      roundScore: parseInt(currentRoundScores[player.id] || '0', 10),
      totalScore: player.totalScore + parseInt(currentRoundScores[player.id] || '0', 10)
    }));

    // Add round to history
    setRounds([...rounds, {
      roundNumber: currentRound,
      wildCard: currentWildCard,
      dealer: currentDealer?.name || 'Not specified',
      scores: processedScores
    }]);

    // Update players' total scores
    setPlayers(processedScores);

    // Check if game is over (after Kings wild card)
    if (currentWildCard === 'K') {
      // Sort players by total score (lowest wins)
      const sortedPlayers = processedScores.sort((a, b) => a.totalScore - b.totalScore);
      
      // Set the winner and show game over modal
      setCurrentDealer(sortedPlayers[0]);
      setIsGameOverModalVisible(true);
      return;
    }

    // Reset for next round
    setCurrentRound(prev => prev + 1);
    
    // Move dealer to next player
    const currentDealerIndex = players.findIndex(p => p.id === currentDealer?.id);
    setCurrentDealer(players[(currentDealerIndex + 1) % players.length]);
    
    // Increment wild card
    const currentWildIndex = WILD_CARDS.indexOf(currentWildCard);
    setCurrentWildCard(WILD_CARDS[(currentWildIndex + 1) % WILD_CARDS.length]);

    // Close scoring modal
    setIsEnterScoresModalVisible(false);

    updatePlayerStats(processedScores);
  };

  // Add Statistics Section to render method
  const renderStatistics = () => {
    if (players.length === 0) return null;
    
    const predictions = predictFinalRankings();

    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2" /> Statistics
        </h2>
        {players.map(player => (
          <div key={player.id} className="bg-white shadow rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-2">{player.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>Average Score: {playerStats[player.id]?.avgScore.toFixed(1)}</p>
                <p>Best Round: {playerStats[player.id]?.bestRound === Infinity ? '-' : playerStats[player.id]?.bestRound}</p>
                <p>Worst Round: {playerStats[player.id]?.worstRound === -1 ? '-' : playerStats[player.id]?.worstRound}</p>
              </div>
              <div>
                <p>Perfect Rounds: {playerStats[player.id]?.perfectRounds}</p>
                <p>Longest Low Streak: {playerStats[player.id]?.lowStreak}</p>
                <p>Current Low Streak: {playerStats[player.id]?.currentLowStreak}</p>
              </div>
            </div>
            {achievements[player.id]?.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold flex items-center">
                  <Award className="mr-2" /> Achievements:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {achievements[player.id].map(achievement => (
                    <span key={achievement} className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {predictions && (
          <div className="bg-white shadow rounded-lg p-4 mt-4">
            <h3 className="font-bold text-lg mb-2">Predicted Final Rankings</h3>
            {predictions.map((pred, index) => (
              <div key={pred.name} className="flex justify-between items-center py-1">
                <span>{index + 1}. {pred.name}</span>
                <span className="text-gray-600">{pred.predictedScore}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6">Five Crowns</h1>
      
      {/* Game Info */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 flex justify-between items-center">
        <div>
          <p className="font-semibold">Wild Card: <span className="text-green-600">{currentWildCard}</span></p>
          <p className="font-semibold">Dealer: <span className="text-purple-600">{currentDealer?.name || 'Not Set'}</span></p>
        </div>
      </div>

      {/* Players Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Current Scores</h2>
          <button 
            onClick={() => setIsAddPlayerModalVisible(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="mr-2" /> Add Player
          </button>
        </div>

        {players.length === 0 ? (
          <p className="text-gray-500 text-center">No players added yet</p>
        ) : (
          <div className="space-y-2">
            {[...players]
              .sort((a, b) => b.totalScore - a.totalScore)
              .map(player => (
              <div 
                key={player.id} 
                className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold">{player.name}</span>
                  <span className="ml-4 text-blue-600 font-bold">Total: {player.totalScore}</span>
                </div>
                <button 
                  onClick={() => removePlayer(player.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Round Button */}
      {players.length > 1 && (
        <button 
          onClick={beginRoundScoring}
          className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 flex items-center justify-center"
        >
          Enter scores for wild card {currentWildCard}
        </button>
      )}

      {/* Add Statistics Section before Round History */}
      {renderStatistics()}

      {/* Round History */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Round History</h2>
        {rounds.length === 0 ? (
          <p className="text-gray-500 text-center">No rounds played yet</p>
        ) : (
          <div className="space-y-2">
            {rounds.slice().reverse().map((round, index) => (
              <div 
                key={round.roundNumber} 
                className="bg-white shadow rounded-lg p-4"
              >
                <div className="font-semibold mb-2">
                  Wild: {round.wildCard}, Dealer: {round.dealer}
                </div>
                <div className="space-y-1">
                  {round.scores.map(score => (
                    <div 
                      key={score.id} 
                      className="flex justify-between"
                    >
                      <span>{score.name}</span>
                      <span className="text-blue-600">{score.roundScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Player Modal */}
      {isAddPlayerModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add New Player</h2>
            <input
              type="text"
              placeholder="Player Name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-between">
              <button 
                onClick={addPlayer}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button 
                onClick={() => setIsAddPlayerModalVisible(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enter Scores Modal */}
      {isEnterScoresModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Enter scores for wild card {currentWildCard}</h2>
            {players.map(player => (
              <div 
                key={player.id} 
                className="flex justify-between items-center mb-4"
              >
                <span className="font-semibold">{player.name}</span>
                <input
                  type="number"
                  placeholder="Score"
                  value={currentRoundScores[player.id]}
                  onChange={(e) => updatePlayerScore(player.id, e.target.value)}
                  className="w-24 p-2 border rounded text-right"
                />
              </div>
            ))}
            <div className="flex justify-between mt-6">
              <button 
                onClick={finishRound}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Finish Round
              </button>
              <button 
                onClick={() => setIsEnterScoresModalVisible(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOverModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96 text-center">
            <Trophy className="mx-auto text-yellow-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <div className="mb-6">
              <p className="text-xl font-semibold">Winner: {currentDealer.name}</p>
              <p className="text-gray-600">Lowest Total Score: {currentDealer.totalScore}</p>
            </div>
            <h3 className="text-xl font-bold mb-4">Final Scores</h3>
            <div className="space-y-2">
              {players
                .sort((a, b) => a.totalScore - b.totalScore)
                .map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`flex justify-between p-2 rounded ${
                      index === 0 
                        ? 'bg-green-100 font-bold' 
                        : 'bg-gray-100'
                    }`}
                  >
                    <span>{player.name}</span>
                    <span>{player.totalScore}</span>
                  </div>
                ))
              }
            </div>
            <div className="flex justify-center mt-6">
              <button 
                onClick={resetGame}
                className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 flex items-center"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiveCrownsScorekeeper;