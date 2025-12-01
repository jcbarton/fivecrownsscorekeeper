import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, PlusCircle, Trash2, Trophy, TrendingUp, Award, Star, Flame, Target, Zap, Crown, Medal, Shield, Sparkles, Users, History, ChevronRight, RotateCcw } from 'lucide-react';

// Achievement definitions with icons, descriptions, and unlock conditions
const ACHIEVEMENT_DEFINITIONS = {
  'Perfect Round': {
    icon: '🎯',
    description: 'Score 0 points in a single round',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  'Hot Streak': {
    icon: '🔥',
    description: 'Win 3 rounds in a row',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  },
  'Consistency King': {
    icon: '👑',
    description: 'Maintain an average score under 10',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  'Comeback Kid': {
    icon: '🦸',
    description: 'Win a round after having the highest score in the previous round',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  'Early Bird': {
    icon: '🐦',
    description: 'Win the first round of a game',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  'Closer': {
    icon: '🏁',
    description: 'Win the final round of a game',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  },
  'Sharpshooter': {
    icon: '🎯',
    description: 'Get 5 perfect rounds in a single game',
    color: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
  },
  'Marathon Runner': {
    icon: '🏃',
    description: 'Complete a full 11-round game',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  },
  'Ice Cold': {
    icon: '🧊',
    description: 'Score the lowest in 5 consecutive rounds',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  'Survivor': {
    icon: '🛡️',
    description: 'Complete a game without ever having the highest score in a round',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  },
  'Rising Star': {
    icon: '⭐',
    description: 'Improve your round score 3 times in a row',
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  },
  'Crown Master': {
    icon: '🏆',
    description: 'Win a complete game of Five Crowns',
    color: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-200 border-amber-400/40'
  },
  'Underdog': {
    icon: '🐕',
    description: 'Win after being in last place at some point',
    color: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
  },
  'Steady Hand': {
    icon: '✋',
    description: 'Have no round score exceed 20 in a complete game',
    color: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  'Speed Demon': {
    icon: '⚡',
    description: 'Get 3 perfect rounds in a single game',
    color: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
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
      <div className="mt-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
        <h2 className="text-xl font-bold mb-4 flex items-center text-white/90">
          <TrendingUp className="mr-3 h-5 w-5 text-primary-400" /> 
          <span>Statistics</span>
        </h2>
        {players.map((player, idx) => (
          <div key={player.id} className="score-card mb-4 animate-slide-up" style={{animationDelay: `${0.1 * idx}s`}}>
            <h3 className="font-bold text-lg mb-4 text-white flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm mr-3">
                {player.name.charAt(0).toUpperCase()}
              </div>
              {player.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-white/60">Average Score</span>
                  <span className="font-semibold text-white">{playerStats[player.id]?.avgScore?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-white/60">Best Round</span>
                  <span className="font-semibold text-emerald-400">{playerStats[player.id]?.bestRound === Infinity ? '-' : playerStats[player.id]?.bestRound}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-white/60">Worst Round</span>
                  <span className="font-semibold text-rose-400">{playerStats[player.id]?.worstRound === -1 ? '-' : playerStats[player.id]?.worstRound}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-white/60">Rounds Played</span>
                  <span className="font-semibold text-white">{playerStats[player.id]?.totalRoundsPlayed || 0}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-white/60">Perfect Rounds</span>
                  <span className="font-semibold text-emerald-400">{playerStats[player.id]?.perfectRounds || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-white/60">Rounds Won</span>
                  <span className="font-semibold text-primary-400">{playerStats[player.id]?.roundsWon || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-white/60">Best Win Streak</span>
                  <span className="font-semibold text-white">{playerStats[player.id]?.lowStreak || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-white/60">Current Streak</span>
                  <span className="font-semibold text-white">{playerStats[player.id]?.currentLowStreak || 0}</span>
                </div>
              </div>
            </div>
            {achievements[player.id]?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="font-semibold flex items-center text-sm mb-3 text-white/80">
                  <Award className="mr-2 h-4 w-4 text-amber-400" /> Achievements ({achievements[player.id].length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {achievements[player.id].map(achievement => {
                    const achievementDef = ACHIEVEMENT_DEFINITIONS[achievement] || {
                      icon: '🏅',
                      description: achievement,
                      color: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    };
                    return (
                      <div
                        key={achievement}
                        className={`achievement-badge ${achievementDef.color}`}
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
          <div className="score-card mt-4">
            <h3 className="font-bold text-lg mb-4 flex items-center text-white">
              <Target className="mr-3 h-5 w-5 text-accent-400" /> Predicted Final Rankings
            </h3>
            <div className="space-y-2">
              {predictions.map((pred, index) => (
                <div key={pred.name} className="flex justify-between items-center p-3 rounded-xl bg-white/5 transition-all duration-300 hover:bg-white/10">
                  <span className="flex items-center text-white">
                    {index === 0 && <Crown className="h-5 w-5 mr-2 text-amber-400" />}
                    {index === 1 && <Medal className="h-5 w-5 mr-2 text-slate-400" />}
                    {index === 2 && <Medal className="h-5 w-5 mr-2 text-amber-600" />}
                    {index > 2 && <span className="w-5 h-5 mr-2 text-center text-white/40">{index + 1}</span>}
                    {pred.name}
                  </span>
                  <span className="text-white/70 font-medium">{pred.predictedScore}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg safe-top safe-bottom">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center mb-3">
          <Crown className="h-10 w-10 text-amber-400 mr-3" />
          <h1 className="text-4xl font-bold text-gradient">Five Crowns</h1>
        </div>
        <p className="text-white/50 text-sm">Score Keeper</p>
      </div>
      
      {/* Game Info Card */}
      <div className="glass-card p-5 mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Wild Card</p>
              <div className="wild-badge">
                {currentWildCard}
              </div>
            </div>
            <div className="h-12 w-px bg-white/10"></div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Dealer</p>
              <p className="text-white font-semibold text-lg">{currentDealer?.name || 'Not Set'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Round</p>
            <p className="text-white font-bold text-2xl">{currentRound}<span className="text-white/30 text-lg">/11</span></p>
          </div>
        </div>
      </div>

      {/* Players Section */}
      <div className="mb-6 animate-slide-up" style={{animationDelay: '0.15s'}}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary-400" />
            Current Scores
          </h2>
          <button 
            onClick={() => setIsAddPlayerModalVisible(true)}
            className="btn-gradient flex items-center text-sm py-2 px-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Player
          </button>
        </div>

        {players.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Users className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No players added yet</p>
            <p className="text-white/30 text-sm mt-1">Add players to start the game</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...players]
              .sort((a, b) => a.totalScore - b.totalScore)
              .map((player, index) => (
              <div 
                key={player.id} 
                className={`score-card flex justify-between items-center ${index === 0 ? 'ring-2 ring-amber-500/30' : ''}`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                    index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'bg-white/10 text-white/60'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{player.name}</span>
                    {index === 0 && players.length > 1 && (
                      <span className="ml-2 text-xs text-amber-400">Leading</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">{player.totalScore}</span>
                    <span className="text-white/40 text-sm ml-1">pts</span>
                  </div>
                  <button 
                    onClick={() => removePlayer(player.id)}
                    className="p-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Round Button */}
      {players.length > 1 && (
        <button 
          onClick={beginRoundScoring}
          className="w-full btn-gradient py-4 text-lg flex items-center justify-center gap-2 mb-6 animate-slide-up"
          style={{animationDelay: '0.2s'}}
        >
          <Sparkles className="h-5 w-5" />
          Enter scores for wild card {currentWildCard}
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Add Statistics Section before Round History */}
      {renderStatistics()}

      {/* Round History */}
      <div className="mt-8 animate-slide-up" style={{animationDelay: '0.25s'}}>
        <h2 className="text-xl font-bold mb-4 text-white flex items-center">
          <History className="mr-2 h-5 w-5 text-primary-400" />
          Round History
        </h2>
        {rounds.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <History className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No rounds played yet</p>
            <p className="text-white/30 text-sm mt-1">Complete a round to see history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rounds.slice().reverse().map((round, index) => (
              <div 
                key={round.roundNumber} 
                className="score-card"
              >
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="wild-badge w-10 h-10 text-base">
                      {round.wildCard}
                    </div>
                    <div>
                      <p className="text-white font-medium">Round {round.roundNumber}</p>
                      <p className="text-white/40 text-xs">Dealer: {round.dealer}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {round.scores
                    .slice()
                    .sort((a, b) => a.roundScore - b.roundScore)
                    .map((score, scoreIndex) => (
                    <div 
                      key={score.id} 
                      className={`flex justify-between items-center p-2 rounded-lg ${scoreIndex === 0 ? 'bg-emerald-500/10' : 'bg-white/5'}`}
                    >
                      <span className={`${scoreIndex === 0 ? 'text-emerald-400' : 'text-white/80'}`}>{score.name}</span>
                      <span className={`font-semibold ${scoreIndex === 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {score.roundScore === 0 ? '🎯 0' : score.roundScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Game Button - Always visible when there's game data */}
      {(players.length > 0 || rounds.length > 0) && (
        <div className="mt-8 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <button 
            onClick={resetGame}
            className="w-full btn-secondary py-4 text-lg flex items-center justify-center gap-2 border border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
          >
            <RotateCcw className="h-5 w-5" />
            Clear Game
          </button>
        </div>
      )}

      {/* Add Player Modal */}
      {isAddPlayerModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <PlusCircle className="mr-3 h-6 w-6 text-primary-400" />
              Add New Player
            </h2>
            <input
              type="text"
              placeholder="Enter player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              className="input-modern mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                onClick={addPlayer}
                className="flex-1 btn-gradient"
              >
                Add Player
              </button>
              <button 
                onClick={() => setIsAddPlayerModalVisible(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enter Scores Modal */}
      {isEnterScoresModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Sparkles className="mr-3 h-6 w-6 text-amber-400" />
                Round Scores
              </h2>
              <div className="wild-badge">
                {currentWildCard}
              </div>
            </div>
            <div className="space-y-4 mb-6">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className="flex justify-between items-center p-4 rounded-xl bg-white/5"
                >
                  <span className="font-semibold text-white">{player.name}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentRoundScores[player.id]}
                    onChange={(e) => updatePlayerScore(player.id, e.target.value)}
                    className="w-24 bg-white/10 border border-white/20 text-white text-right px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={finishRound}
                className="flex-1 btn-gradient"
              >
                Finish Round
              </button>
              <button 
                onClick={() => setIsEnterScoresModalVisible(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOverModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content text-center max-w-sm">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-amber-500/30 blur-2xl rounded-full"></div>
                <Trophy className="relative h-20 w-20 text-amber-400 mx-auto animate-pulse-slow" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
            <div className="mb-6">
              <p className="text-amber-400 text-xl font-semibold">{currentDealer.name}</p>
              <p className="text-white/50">Winner with {currentDealer.totalScore} points</p>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-lg font-bold text-white/80 mb-3">Final Rankings</h3>
              <div className="space-y-2">
                {players
                  .sort((a, b) => a.totalScore - b.totalScore)
                  .map((player, index) => (
                    <div 
                      key={player.id} 
                      className={`flex justify-between items-center p-3 rounded-xl ${
                        index === 0 
                          ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30' 
                          : 'bg-white/5'
                      }`}
                    >
                      <span className="flex items-center text-white">
                        {index === 0 && <Crown className="h-5 w-5 mr-2 text-amber-400" />}
                        {index === 1 && <Medal className="h-5 w-5 mr-2 text-slate-400" />}
                        {index === 2 && <Medal className="h-5 w-5 mr-2 text-amber-600" />}
                        {index > 2 && <span className="w-5 h-5 mr-2 text-center text-white/40">{index + 1}</span>}
                        {player.name}
                      </span>
                      <span className={`font-bold ${index === 0 ? 'text-amber-400' : 'text-white/70'}`}>
                        {player.totalScore}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
            <button 
              onClick={resetGame}
              className="w-full btn-gradient py-4 text-lg flex items-center justify-center"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiveCrownsScorekeeper;