import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, PlusCircle, Trash2, Trophy, TrendingUp, Award, Star, Flame, Target, Zap, Crown, Medal, Shield, Sparkles } from 'lucide-react';

// Achievement definitions with icons, descriptions, and unlock conditions
const ACHIEVEMENT_DEFINITIONS = {
  'Perfect Round': {
    icon: '🎯',
    description: 'Score 0 points in a single round',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  'Hot Streak': {
    icon: '🔥',
    description: 'Win 3 rounds in a row',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  'Consistency King': {
    icon: '👑',
    description: 'Maintain an average score under 10',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  'Comeback Kid': {
    icon: '🦸',
    description: 'Win a round after having the highest score in the previous round',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  'Early Bird': {
    icon: '🐦',
    description: 'Win the first round of a game',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  'Closer': {
    icon: '🏁',
    description: 'Win the final round of a game',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  'Sharpshooter': {
    icon: '🎯',
    description: 'Get 5 perfect rounds in a single game',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  'Marathon Runner': {
    icon: '🏃',
    description: 'Complete a full 11-round game',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  'Ice Cold': {
    icon: '🧊',
    description: 'Score the lowest in 5 consecutive rounds',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  'Survivor': {
    icon: '🛡️',
    description: 'Complete a game without ever having the highest score in a round',
    color: 'bg-gray-100 text-gray-800 border-gray-300'
  },
  'Rising Star': {
    icon: '⭐',
    description: 'Improve your round score 3 times in a row',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  'Crown Master': {
    icon: '🏆',
    description: 'Win a complete game of Five Crowns',
    color: 'bg-yellow-200 text-yellow-900 border-yellow-400'
  },
  'Underdog': {
    icon: '🐕',
    description: 'Win after being in last place at some point',
    color: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  'Steady Hand': {
    icon: '✋',
    description: 'Have no round score exceed 20 in a complete game',
    color: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  'Speed Demon': {
    icon: '⚡',
    description: 'Get 3 perfect rounds in a single game',
    color: 'bg-violet-100 text-violet-800 border-violet-300'
  }
};

const STORAGE_KEY = 'fivecrowns_game_state';

// Load initial state from localStorage (cached to avoid multiple calls)
let cachedInitialState = null;
let hasLoadedInitialState = false;

const getInitialState = () => {
  if (!hasLoadedInitialState) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        cachedInitialState = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading game state from localStorage:', e);
    }
    hasLoadedInitialState = true;
  }
  return cachedInitialState;
};

const FiveCrownsScorekeeper = () => {
  // Possible wild cards for Five Crowns
  const WILD_CARDS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // Track if component has been initialized to avoid saving empty state on first render
  const isInitialized = useRef(false);

  // State for players - use lazy initialization to load from localStorage only once
  const [players, setPlayers] = useState(() => getInitialState()?.players || []);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  // State for game tracking
  const [rounds, setRounds] = useState(() => getInitialState()?.rounds || []);
  const [currentRound, setCurrentRound] = useState(() => getInitialState()?.currentRound || 1);
  const [currentWildCard, setCurrentWildCard] = useState(() => getInitialState()?.currentWildCard || '3');
  const [currentDealer, setCurrentDealer] = useState(() => getInitialState()?.currentDealer || null);
  
  // Modal visibility states
  const [isAddPlayerModalVisible, setIsAddPlayerModalVisible] = useState(false);
  const [isEnterScoresModalVisible, setIsEnterScoresModalVisible] = useState(false);
  const [isGameOverModalVisible, setIsGameOverModalVisible] = useState(false);
  
  // Temporary scores for current round
  const [currentRoundScores, setCurrentRoundScores] = useState({});

  // New state for statistics
  const [playerStats, setPlayerStats] = useState(() => getInitialState()?.playerStats || {});
  const [achievements, setAchievements] = useState(() => getInitialState()?.achievements || {});

  // Save game state to localStorage whenever relevant state changes
  useEffect(() => {
    // Skip saving on initial mount to avoid overwriting saved state with potentially empty values
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    
    const gameState = {
      players,
      rounds,
      currentRound,
      currentWildCard,
      currentDealer,
      playerStats,
      achievements
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.error('Error saving game state to localStorage:', e);
    }
  }, [players, rounds, currentRound, currentWildCard, currentDealer, playerStats, achievements]);

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
          perfectRounds: 0,
          totalRoundsPlayed: 0,
          roundsWon: 0,
          improvementStreak: 0,
          currentImprovementStreak: 0,
          lastRoundScore: null,
          hadHighestScoreInGame: false,
          wasInLastPlace: false,
          maxRoundScore: 0
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
    setPlayerStats({});
    setAchievements({});
    setIsGameOverModalVisible(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing game state from localStorage:', e);
    }
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
    const minRoundScore = Math.min(...roundScores.map(s => s.roundScore));
    const maxRoundScore = Math.max(...roundScores.map(s => s.roundScore));
    const isFirstRound = rounds.length === 0;
    const isFinalRound = currentWildCard === 'K';
    
    // Get previous round data for comeback detection
    const previousRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;
    
    roundScores.forEach(score => {
      const playerRounds = [...rounds, { scores: roundScores }].filter(r => 
        r.scores.find(s => s.id === score.id)
      );
      
      const stats = newStats[score.id];
      const roundScore = score.roundScore;
      
      // Update totals
      stats.totalRoundsPlayed = (stats.totalRoundsPlayed || 0) + 1;
      
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
      stats.maxRoundScore = Math.max(stats.maxRoundScore || 0, roundScore);

      // Update streaks
      const isLowest = minRoundScore === roundScore;
      const isHighest = maxRoundScore === roundScore;

      if (isLowest) {
        stats.roundsWon = (stats.roundsWon || 0) + 1;
      }

      stats.currentLowStreak = isLowest ? stats.currentLowStreak + 1 : 0;
      stats.currentHighStreak = isHighest ? stats.currentHighStreak + 1 : 0;
      stats.lowStreak = Math.max(stats.lowStreak, stats.currentLowStreak);
      stats.highStreak = Math.max(stats.highStreak, stats.currentHighStreak);

      // Track if player ever had highest score or was in last place
      if (isHighest) {
        stats.hadHighestScoreInGame = true;
      }
      
      // Check if player was in last place (highest total) at any point
      const currentTotals = roundScores.map(s => ({ id: s.id, total: s.totalScore }));
      const maxTotal = Math.max(...currentTotals.map(t => t.total));
      if (score.totalScore === maxTotal && currentTotals.filter(t => t.total === maxTotal).length === 1) {
        stats.wasInLastPlace = true;
      }

      // Track improvement streak (lower score than previous round)
      if (stats.lastRoundScore !== null && roundScore < stats.lastRoundScore) {
        stats.currentImprovementStreak = (stats.currentImprovementStreak || 0) + 1;
        stats.improvementStreak = Math.max(stats.improvementStreak || 0, stats.currentImprovementStreak);
      } else if (stats.lastRoundScore !== null && roundScore >= stats.lastRoundScore) {
        stats.currentImprovementStreak = 0;
      }
      stats.lastRoundScore = roundScore;

      // Check for achievements
      const newAchievements = [];
      
      // Perfect Round - score 0
      if (roundScore === 0) {
        stats.perfectRounds++;
        if (!achievements[score.id]?.includes('Perfect Round')) {
          newAchievements.push('Perfect Round');
        }
      }
      
      // Hot Streak - win 3 rounds in a row
      if (stats.currentLowStreak === 3 && !achievements[score.id]?.includes('Hot Streak')) {
        newAchievements.push('Hot Streak');
      }
      
      // Ice Cold - win 5 rounds in a row
      if (stats.currentLowStreak === 5 && !achievements[score.id]?.includes('Ice Cold')) {
        newAchievements.push('Ice Cold');
      }
      
      // Consistency King - average under 10 (after at least 3 rounds)
      if (stats.avgScore < 10 && stats.totalRoundsPlayed >= 3 && !achievements[score.id]?.includes('Consistency King')) {
        newAchievements.push('Consistency King');
      }
      
      // Comeback Kid - won this round after having highest score last round
      if (previousRound && isLowest) {
        const prevPlayerScore = previousRound.scores.find(s => s.id === score.id);
        const prevMaxScore = Math.max(...previousRound.scores.map(s => s.roundScore));
        if (prevPlayerScore && prevPlayerScore.roundScore === prevMaxScore && !achievements[score.id]?.includes('Comeback Kid')) {
          newAchievements.push('Comeback Kid');
        }
      }
      
      // Early Bird - win the first round
      if (isFirstRound && isLowest && !achievements[score.id]?.includes('Early Bird')) {
        newAchievements.push('Early Bird');
      }
      
      // Rising Star - improve score 3 times in a row
      if (stats.currentImprovementStreak >= 3 && !achievements[score.id]?.includes('Rising Star')) {
        newAchievements.push('Rising Star');
      }
      
      // Speed Demon - 3 perfect rounds in a game
      if (stats.perfectRounds >= 3 && !achievements[score.id]?.includes('Speed Demon')) {
        newAchievements.push('Speed Demon');
      }
      
      // Sharpshooter - 5 perfect rounds in a game
      if (stats.perfectRounds >= 5 && !achievements[score.id]?.includes('Sharpshooter')) {
        newAchievements.push('Sharpshooter');
      }

      if (newAchievements.length > 0) {
        setAchievements(prev => ({
          ...prev,
          [score.id]: [...new Set([...(prev[score.id] || []), ...newAchievements])]
        }));
      }
    });

    setPlayerStats(newStats);
  };

  // Award end-of-game achievements
  const awardEndGameAchievements = (sortedPlayers) => {
    const winner = sortedPlayers[0];
    const newAchievements = {};
    
    sortedPlayers.forEach(player => {
      const playerAchievements = [];
      const stats = playerStats[player.id];
      
      // Marathon Runner - completed full game
      if (!achievements[player.id]?.includes('Marathon Runner')) {
        playerAchievements.push('Marathon Runner');
      }
      
      // Crown Master - winner of the game
      if (player.id === winner.id && !achievements[player.id]?.includes('Crown Master')) {
        playerAchievements.push('Crown Master');
      }
      
      // Closer - winner of final round (lowest score in final round)
      const finalRoundScores = sortedPlayers.map(p => {
        const lastRound = rounds[rounds.length - 1];
        return lastRound?.scores.find(s => s.id === p.id)?.roundScore || 0;
      });
      const minFinalScore = Math.min(...finalRoundScores);
      const playerFinalScore = rounds[rounds.length - 1]?.scores.find(s => s.id === player.id)?.roundScore;
      if (playerFinalScore === minFinalScore && !achievements[player.id]?.includes('Closer')) {
        playerAchievements.push('Closer');
      }
      
      // Survivor - never had highest score in any round
      if (!stats?.hadHighestScoreInGame && !achievements[player.id]?.includes('Survivor')) {
        playerAchievements.push('Survivor');
      }
      
      // Underdog - won after being in last place
      if (player.id === winner.id && stats?.wasInLastPlace && !achievements[player.id]?.includes('Underdog')) {
        playerAchievements.push('Underdog');
      }
      
      // Steady Hand - no round score exceeded 20
      if ((stats?.maxRoundScore || 0) <= 20 && !achievements[player.id]?.includes('Steady Hand')) {
        playerAchievements.push('Steady Hand');
      }
      
      if (playerAchievements.length > 0) {
        newAchievements[player.id] = playerAchievements;
      }
    });
    
    if (Object.keys(newAchievements).length > 0) {
      setAchievements(prev => {
        const updated = { ...prev };
        Object.entries(newAchievements).forEach(([playerId, achList]) => {
          updated[playerId] = [...new Set([...(updated[playerId] || []), ...achList])];
        });
        return updated;
      });
    }
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
      
      // Update stats one final time before end-game achievements
      updatePlayerStats(processedScores);
      
      // Award end-game achievements
      awardEndGameAchievements(sortedPlayers);
      
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
            <h3 className="font-bold text-lg mb-3">{player.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="flex justify-between">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-medium">{playerStats[player.id]?.avgScore?.toFixed(1) || '0.0'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Best Round:</span>
                  <span className="font-medium text-green-600">{playerStats[player.id]?.bestRound === Infinity ? '-' : playerStats[player.id]?.bestRound}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Worst Round:</span>
                  <span className="font-medium text-red-600">{playerStats[player.id]?.worstRound === -1 ? '-' : playerStats[player.id]?.worstRound}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Rounds Played:</span>
                  <span className="font-medium">{playerStats[player.id]?.totalRoundsPlayed || 0}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="flex justify-between">
                  <span className="text-gray-600">Perfect Rounds:</span>
                  <span className="font-medium text-green-600">{playerStats[player.id]?.perfectRounds || 0}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Rounds Won:</span>
                  <span className="font-medium text-blue-600">{playerStats[player.id]?.roundsWon || 0}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Best Win Streak:</span>
                  <span className="font-medium">{playerStats[player.id]?.lowStreak || 0}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Current Streak:</span>
                  <span className="font-medium">{playerStats[player.id]?.currentLowStreak || 0}</span>
                </p>
              </div>
            </div>
            {achievements[player.id]?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="font-semibold flex items-center text-sm mb-2">
                  <Award className="mr-2 h-4 w-4" /> Achievements ({achievements[player.id].length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {achievements[player.id].map(achievement => {
                    const achievementDef = ACHIEVEMENT_DEFINITIONS[achievement] || {
                      icon: '🏅',
                      description: achievement,
                      color: 'bg-gray-100 text-gray-800 border-gray-300'
                    };
                    return (
                      <div
                        key={achievement}
                        className={`${achievementDef.color} text-xs px-2 py-1 rounded-full border flex items-center gap-1 cursor-help`}
                        title={achievementDef.description}
                      >
                        <span>{achievementDef.icon}</span>
                        <span>{achievement}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        {predictions && (
          <div className="bg-white shadow rounded-lg p-4 mt-4">
            <h3 className="font-bold text-lg mb-2 flex items-center">
              <Target className="mr-2 h-5 w-5" /> Predicted Final Rankings
            </h3>
            {predictions.map((pred, index) => (
              <div key={pred.name} className="flex justify-between items-center py-1">
                <span className="flex items-center">
                  {index === 0 && <Crown className="h-4 w-4 mr-1 text-yellow-500" />}
                  {index + 1}. {pred.name}
                </span>
                <span className="text-gray-600 font-medium">{pred.predictedScore}</span>
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