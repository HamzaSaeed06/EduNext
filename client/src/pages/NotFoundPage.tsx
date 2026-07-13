import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-center max-w-md"
      >
        <svg viewBox="0 0 120 80" className="w-32 mx-auto mb-6" aria-hidden="true">
          <path
            d="M10,60 C25,50 35,40 50,45 C65,50 70,30 90,35 C105,38 110,50 115,55"
            fill="none"
            stroke="#DADFD3"
            strokeWidth="3"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <circle cx="115" cy="55" r="5" fill="#E2A03E" />
          <text x="60" y="75" textAnchor="middle" className="text-micro" fill="#5A6B60" fontSize="10">
            Trail not found
          </text>
        </svg>
        <h1 className="font-display text-display-l text-ink-primary mb-3">Lost on the trail?</h1>
        <p className="text-body text-ink-muted mb-6">
          This path doesn't exist. Head back to the map and find a course to explore.
        </p>
        <Link to="/">
          <Button size="lg">Back to home</Button>
        </Link>
      </motion.div>
    </div>
  )
}
