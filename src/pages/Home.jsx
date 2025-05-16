import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import MainFeature from '../components/MainFeature';
import getIcon from '../utils/iconUtils';

const MoonIcon = getIcon('Moon');
const SunIcon = getIcon('Sun');
const GithubIcon = getIcon('Github');

function Home({ darkMode, toggleDarkMode }) {
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const increaseScore = (points) => {
    setScore(prevScore => prevScore + points);
    if ((score + points) % 1000 === 0 && score > 0) {
      toast.success(`Milestone reached: ${score + points} points!`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b border-surface-200 dark:border-surface-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="mr-2 text-primary"
            >
              🏃
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Vivek7-Rush
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-surface-600 dark:text-surface-300 hover:text-primary dark:hover:text-primary-light"
            >
              How to Play
            </button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-surface-200 dark:bg-surface-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5 text-yellow-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-surface-600" />
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        {showInstructions && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 bg-surface-100 dark:bg-surface-800 rounded-xl shadow-card"
          >
            <h3 className="text-xl mb-4 font-bold text-primary">How to Play</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Use arrow keys or swipe to move your character left, right, jump and slide</li>
              <li>Collect coins to increase your score</li>
              <li>Avoid obstacles to stay in the game</li>
              <li>The game speed increases as you progress</li>
              <li>Collect power-ups for special abilities</li>
            </ul>
            <button 
              onClick={() => setShowInstructions(false)}
              className="mt-4 game-button"
            >
              Got it!
            </button>
          </motion.div>
        )}

        <div className="mb-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Current Score: <span className="text-primary">{score}</span>
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            Start running and collect coins to increase your score!
          </p>
        </div>

        <MainFeature score={score} increaseScore={increaseScore} />
      </main>

      <footer className="py-6 px-4 sm:px-6 md:px-8 bg-surface-100 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 md:mb-0">
            © 2023 Vivek7-Rush. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
              className="text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary-light">
              <GithubIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;