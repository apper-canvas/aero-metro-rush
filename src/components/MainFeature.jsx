import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

const ArrowUpIcon = getIcon('ArrowUp');
const ArrowDownIcon = getIcon('ArrowDown');
const ArrowLeftIcon = getIcon('ArrowLeft');
const ArrowRightIcon = getIcon('ArrowRight');
const PauseIcon = getIcon('Pause');
const PlayIcon = getIcon('Play');
const RefreshCwIcon = getIcon('RefreshCw');
const CoinsIcon = getIcon('Coins');
const HeartIcon = getIcon('Heart');
const ZapIcon = getIcon('Zap');
const InfoIcon = getIcon('Info');

function MainFeature({ score, increaseScore }) {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const [character, setCharacter] = useState('boy');
  const [characterPosition, setCharacterPosition] = useState(1); // 0: left, 1: center, 2: right
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [coins, setCoins] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [powerUpActive, setPowerUpActive] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  
  const gameAreaRef = useRef(null);
  const gameLoopRef = useRef(null);
  const obstacleLoopRef = useRef(null);
  const coinLoopRef = useRef(null);
  const powerUpLoopRef = useRef(null);

  // Character options
  const characters = [
    { id: 'boy', name: 'Boy', emoji: '🧑' },
    { id: 'girl', name: 'Girl', emoji: '👧' },
    { id: 'robot', name: 'Robot', emoji: '🤖' },
    { id: 'alien', name: 'Alien', emoji: '👽' },
  ];
  
  // Game controls
  const handleKeyDown = (e) => {
    if (!gameStarted || gamePaused || gameOver) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        if (characterPosition > 0) {
          setCharacterPosition(prev => prev - 1);
        }
        break;
      case 'ArrowRight':
        if (characterPosition < 2) {
          setCharacterPosition(prev => prev + 1);
        }
        break;
      case 'ArrowUp':
        if (!isJumping) {
          jump();
        }
        break;
      case 'ArrowDown':
        if (!isSliding) {
          slide();
        }
        break;
      default:
        break;
    }
  };

  // Touch controls
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !gameStarted || gamePaused || gameOver) return;
    
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStart.x;
    const diffY = touch.clientY - touchStart.y;
    const threshold = 50;
    
    // Detect swipe direction
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > threshold) {
        // Swipe right
        if (characterPosition < 2) {
          setCharacterPosition(prev => prev + 1);
        }
      } else if (diffX < -threshold) {
        // Swipe left
        if (characterPosition > 0) {
          setCharacterPosition(prev => prev - 1);
        }
      }
    } else {
      if (diffY > threshold) {
        // Swipe down
        if (!isSliding) {
          slide();
        }
      } else if (diffY < -threshold) {
        // Swipe up
        if (!isJumping) {
          jump();
        }
      }
    }
    
    setTouchStart(null);
  };

  const jump = () => {
    setIsJumping(true);
    setTimeout(() => {
      setIsJumping(false);
    }, 800);
  };

  const slide = () => {
    setIsSliding(true);
    setTimeout(() => {
      setIsSliding(false);
    }, 800);
  };

  // Game mechanics
  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    
    setGameStarted(true);
    setGamePaused(false);
    setGameOver(false);
    
    // Start game loops
    startGameLoop();
    startObstacleLoop();
    startCoinLoop();
    startPowerUpLoop();
    
    toast.success("Game started! Good luck!");
  };

  const pauseGame = () => {
    setGamePaused(!gamePaused);
    
    if (!gamePaused) {
      // Pause all loops
      clearInterval(gameLoopRef.current);
      clearInterval(obstacleLoopRef.current);
      clearInterval(coinLoopRef.current);
      clearInterval(powerUpLoopRef.current);
      toast.info("Game paused");
    } else {
      // Resume all loops
      startGameLoop();
      startObstacleLoop();
      startCoinLoop();
      startPowerUpLoop();
      toast.info("Game resumed");
    }
  };

  const resetGame = () => {
    increaseScore(-score); // Reset score to 0
    setLives(3);
    setCharacterPosition(1);
    setIsJumping(false);
    setIsSliding(false);
    setObstacles([]);
    setCoins([]);
    setPowerUps([]);
    setGameSpeed(1);
    setPowerUpActive(null);
    setGameOver(false);
    
    toast.info("Game reset. Ready to play again!");
  };

  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    
    // Clear all intervals
    clearInterval(gameLoopRef.current);
    clearInterval(obstacleLoopRef.current);
    clearInterval(coinLoopRef.current);
    clearInterval(powerUpLoopRef.current);
    
    toast.error("Game over! Your final score: " + score);
  };

  // Game loops
  const startGameLoop = () => {
    gameLoopRef.current = setInterval(() => {
      // Increase game speed gradually
      setGameSpeed(prev => Math.min(prev + 0.0005, 2.5));
      
      // Check collisions
      checkCollisions();
    }, 16);
  };

  const startObstacleLoop = () => {
    obstacleLoopRef.current = setInterval(() => {
      // Generate obstacles randomly
      if (Math.random() < 0.05 * gameSpeed) {
        const lane = Math.floor(Math.random() * 3);
        const type = Math.random() < 0.5 ? 'barrier' : 'car';
        const emoji = type === 'barrier' ? '🚧' : '🚗';
        
        setObstacles(prev => [
          ...prev, 
          { id: Date.now(), lane, type, emoji, position: 100 }
        ]);
      }
      
      // Move obstacles
      setObstacles(prev => {
        const updated = prev.map(obstacle => ({
          ...obstacle,
          position: obstacle.position - (1 * gameSpeed)
        }));
        
        // Remove obstacles that are out of view
        return updated.filter(obstacle => obstacle.position > -10);
      });
    }, 50);
  };

  const startCoinLoop = () => {
    coinLoopRef.current = setInterval(() => {
      // Generate coins randomly
      if (Math.random() < 0.03 * gameSpeed) {
        const lane = Math.floor(Math.random() * 3);
        const isAirborne = Math.random() < 0.3;
        
        setCoins(prev => [
          ...prev, 
          { id: Date.now(), lane, isAirborne, position: 100 }
        ]);
      }
      
      // Move coins
      setCoins(prev => {
        const updated = prev.map(coin => ({
          ...coin,
          position: coin.position - (1 * gameSpeed)
        }));
        
        // Remove coins that are out of view
        return updated.filter(coin => coin.position > -10);
      });
    }, 100);
  };

  const startPowerUpLoop = () => {
    powerUpLoopRef.current = setInterval(() => {
      // Generate power-ups rarely
      if (Math.random() < 0.01 * gameSpeed) {
        const lane = Math.floor(Math.random() * 3);
        const types = ['magnet', 'shield', 'speedBoost'];
        const type = types[Math.floor(Math.random() * types.length)];
        let emoji = '❓';
        
        if (type === 'magnet') emoji = '🧲';
        else if (type === 'shield') emoji = '🛡️';
        else if (type === 'speedBoost') emoji = '⚡';
        
        setPowerUps(prev => [
          ...prev, 
          { id: Date.now(), lane, type, emoji, position: 100 }
        ]);
      }
      
      // Move power-ups
      setPowerUps(prev => {
        const updated = prev.map(powerUp => ({
          ...powerUp,
          position: powerUp.position - (1 * gameSpeed)
        }));
        
        // Remove power-ups that are out of view
        return updated.filter(powerUp => powerUp.position > -10);
      });
    }, 200);
  };

  const checkCollisions = () => {
    // Skip if game hasn't started or is paused/over
    if (!gameStarted || gamePaused || gameOver) return;
    
    // Check collision with obstacles
    obstacles.forEach(obstacle => {
      if (Math.abs(obstacle.position - 15) < 5 && obstacle.lane === characterPosition) {
        // Check if character is jumping over low obstacles or sliding under high obstacles
        const canAvoid = (isJumping && obstacle.type === 'barrier') || (isSliding && obstacle.type === 'car');
        
        if (!canAvoid && !powerUpActive) {
          // Hit by obstacle
          if (lives > 1) {
            setLives(prev => prev - 1);
            // Remove the obstacle
            setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
            toast.warning("Ouch! Lives remaining: " + (lives - 1));
          } else {
            endGame();
          }
        }
      }
    });
    
    // Check collision with coins
    coins.forEach(coin => {
      if (Math.abs(coin.position - 15) < 5 && coin.lane === characterPosition) {
        // Collect coin if on ground or if jumping and coin is airborne
        const canCollect = !coin.isAirborne || (coin.isAirborne && isJumping);
        
        if (canCollect) {
          // Collect coin
          setCoins(prev => prev.filter(c => c.id !== coin.id));
          increaseScore(10);
        }
      }
    });
    
    // Check collision with power-ups
    powerUps.forEach(powerUp => {
      if (Math.abs(powerUp.position - 15) < 5 && powerUp.lane === characterPosition) {
        // Collect power-up
        setPowerUps(prev => prev.filter(p => p.id !== powerUp.id));
        
        // Apply power-up effect
        setPowerUpActive(powerUp.type);
        
        // Show toast based on power-up type
        if (powerUp.type === 'magnet') {
          toast.success("Magnet activated! Coins are attracted to you!");
        } else if (powerUp.type === 'shield') {
          toast.success("Shield activated! You're invincible for a short time!");
        } else if (powerUp.type === 'speedBoost') {
          toast.success("Speed boost activated! Running faster!");
          setGameSpeed(prev => prev * 1.5);
        }
        
        // Power-up duration
        setTimeout(() => {
          setPowerUpActive(null);
          
          // Reset game speed if it was a speed boost
          if (powerUp.type === 'speedBoost') {
            setGameSpeed(prev => prev / 1.5);
          }
        }, 5000);
      }
    });
  };

  // Add event listeners for keyboard and touch controls
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clear all intervals on unmount
      clearInterval(gameLoopRef.current);
      clearInterval(obstacleLoopRef.current);
      clearInterval(coinLoopRef.current);
      clearInterval(powerUpLoopRef.current);
    };
  }, [gameStarted, gamePaused, gameOver, characterPosition, isJumping, isSliding]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex flex-wrap justify-center gap-4">
        {characters.map(char => (
          <button
            key={char.id}
            onClick={() => setCharacter(char.id)}
            className={`p-3 rounded-xl transition-all ${
              character === char.id 
                ? 'bg-primary text-white scale-110 shadow-lg'
                : 'bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600'
            }`}
          >
            <div className="text-2xl mb-1">{char.emoji}</div>
            <div className="text-xs font-medium">{char.name}</div>
          </button>
        ))}
      </div>
      
      <div 
        ref={gameAreaRef}
        className="game-canvas w-full max-w-2xl h-80 md:h-96 mb-8 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white p-4 z-50">
            <motion.h2 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold mb-4 text-center"
            >
              Game Over!
            </motion.h2>
            <p className="text-xl mb-6">Final Score: <span className="text-primary font-bold">{score}</span></p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="game-button px-8 py-3 text-lg"
            >
              <RefreshCwIcon className="w-5 h-5 mr-2 inline" />
              Play Again
            </motion.button>
          </div>
        ) : !gameStarted ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4 z-50">
            <motion.h2 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
              className="text-3xl font-bold mb-4 text-center"
            >
              Ready to Run?
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="game-button px-8 py-3 text-lg"
            >
              <PlayIcon className="w-5 h-5 mr-2 inline" />
              Start Game
            </motion.button>
          </div>
        ) : null}
        
        {/* Game HUD */}
        {gameStarted && !gameOver && (
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-40">
            <div className="flex items-center">
              <button 
                onClick={pauseGame}
                className="p-2 bg-white dark:bg-surface-800 rounded-full shadow-md"
              >
                {gamePaused ? (
                  <PlayIcon className="w-5 h-5 text-primary" />
                ) : (
                  <PauseIcon className="w-5 h-5 text-primary" />
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-surface-800 px-3 py-1 rounded-full flex items-center">
                <CoinsIcon className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-medium text-sm">{score}</span>
              </div>
              
              <div className="bg-white dark:bg-surface-800 px-3 py-1 rounded-full flex items-center">
                <HeartIcon className="w-4 h-4 text-red-500 mr-1" />
                <span className="font-medium text-sm">{lives}</span>
              </div>
              
              {powerUpActive && (
                <div className="bg-primary px-3 py-1 rounded-full flex items-center text-white">
                  <ZapIcon className="w-4 h-4 mr-1" />
                  <span className="font-medium text-sm">Active</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Game character */}
        {gameStarted && (
          <div 
            className={`character text-4xl ${isJumping ? 'animate-bounce' : ''} ${isSliding ? 'scale-75' : ''}`}
            style={{ 
              left: `${characterPosition === 0 ? '25%' : characterPosition === 1 ? '50%' : '75%'}`,
              bottom: isJumping ? '40px' : '10px',
              transition: 'left 0.2s ease, bottom 0.3s ease'
            }}
          >
            {characters.find(c => c.id === character)?.emoji || '🏃'}
          </div>
        )}
        
        {/* Obstacles */}
        {obstacles.map(obstacle => (
          <div 
            key={obstacle.id}
            className="obstacle text-4xl"
            style={{ 
              left: `${obstacle.lane === 0 ? '25%' : obstacle.lane === 1 ? '50%' : '75%'}`,
              bottom: '10px',
              transform: `translateX(-50%) translateZ(${(100 - obstacle.position) * 10}px)`,
              opacity: 1 - (Math.max(0, obstacle.position - 90) / 10)
            }}
          >
            {obstacle.emoji}
          </div>
        ))}
        
        {/* Coins */}
        {coins.map(coin => (
          <div 
            key={coin.id}
            className="coin text-3xl"
            style={{ 
              left: `${coin.lane === 0 ? '25%' : coin.lane === 1 ? '50%' : '75%'}`,
              bottom: coin.isAirborne ? '40px' : '10px',
              transform: `translateX(-50%) translateZ(${(100 - coin.position) * 10}px)`,
              opacity: 1 - (Math.max(0, coin.position - 90) / 10)
            }}
          >
            💰
          </div>
        ))}
        
        {/* Power-ups */}
        {powerUps.map(powerUp => (
          <div 
            key={powerUp.id}
            className="obstacle text-3xl"
            style={{ 
              left: `${powerUp.lane === 0 ? '25%' : powerUp.lane === 1 ? '50%' : '75%'}`,
              bottom: '10px',
              transform: `translateX(-50%) translateZ(${(100 - powerUp.position) * 10}px)`,
              opacity: 1 - (Math.max(0, powerUp.position - 90) / 10)
            }}
          >
            {powerUp.emoji}
          </div>
        ))}
        
        {/* Track/road */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-surface-300 dark:bg-surface-600"></div>
      </div>
      
      {/* Mobile controls */}
      <div className="md:hidden w-full max-w-md grid grid-cols-3 gap-4 mb-6">
        <div className="flex justify-center">
          <button 
            onTouchStart={() => {
              if (!gameStarted || gamePaused || gameOver) return;
              if (characterPosition > 0) {
                setCharacterPosition(prev => prev - 1);
              }
            }}
            className="p-4 bg-surface-200 dark:bg-surface-700 rounded-xl active:bg-primary active:text-white"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col gap-2 items-center">
          <button 
            onTouchStart={() => {
              if (!gameStarted || gamePaused || gameOver) return;
              if (!isJumping) {
                jump();
              }
            }}
            className="p-4 bg-surface-200 dark:bg-surface-700 rounded-xl active:bg-primary active:text-white"
          >
            <ArrowUpIcon className="w-6 h-6" />
          </button>
          
          <button 
            onTouchStart={() => {
              if (!gameStarted || gamePaused || gameOver) return;
              if (!isSliding) {
                slide();
              }
            }}
            className="p-4 bg-surface-200 dark:bg-surface-700 rounded-xl active:bg-primary active:text-white"
          >
            <ArrowDownIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex justify-center">
          <button 
            onTouchStart={() => {
              if (!gameStarted || gamePaused || gameOver) return;
              if (characterPosition < 2) {
                setCharacterPosition(prev => prev + 1);
              }
            }}
            className="p-4 bg-surface-200 dark:bg-surface-700 rounded-xl active:bg-primary active:text-white"
          >
            <ArrowRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="w-full max-w-md bg-surface-100 dark:bg-surface-800 p-4 rounded-xl mb-8">
        <h3 className="flex items-center text-lg font-bold mb-2">
          <InfoIcon className="w-5 h-5 mr-2 text-primary" />
          Game Instructions
        </h3>
        <div className="text-sm text-surface-700 dark:text-surface-300 space-y-2">
          <p>
            <span className="font-medium">Desktop:</span> Use arrow keys to move left/right, jump (↑), and slide (↓).
          </p>
          <p>
            <span className="font-medium">Mobile:</span> Use on-screen arrows or swipe in desired direction.
          </p>
          <p>
            <span className="font-medium">Goal:</span> Collect coins (💰) and avoid obstacles (🚧, 🚗) to achieve high score.
          </p>
          <p>
            <span className="font-medium">Power-ups:</span> Magnet (🧲), Shield (🛡️), Speed Boost (⚡)
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainFeature;