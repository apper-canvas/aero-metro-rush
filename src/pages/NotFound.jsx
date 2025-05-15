import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

const ArrowLeftIcon = getIcon('ArrowLeft');
const MoonIcon = getIcon('Moon');
const SunIcon = getIcon('Sun');

function NotFound({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface-50 dark:bg-surface-900">
      <div className="absolute top-4 right-4">
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
      
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-card text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              y: [0, -10, 0, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="text-6xl"
          >
            🚫
          </motion.div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-surface-900 dark:text-white">404</h1>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-primary">Page Not Found</h2>
        
        <p className="mb-6 text-surface-600 dark:text-surface-300">
          Oops! Looks like you've run into an obstacle. The page you're looking for doesn't exist or has been moved.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary text-white font-medium rounded-xl transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}

export default NotFound;