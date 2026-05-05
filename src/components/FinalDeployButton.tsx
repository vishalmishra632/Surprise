import { motion } from 'framer-motion';

type FinalDeployButtonProps = {
  onDeploy: () => void;
  label: string;
};

export default function FinalDeployButton({ onDeploy, label }: FinalDeployButtonProps) {
  return (
    <motion.button
      type="button"
      data-final-deploy-button
      onClick={onDeploy}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="relative inline-flex items-center gap-3 px-12 py-5 font-mono uppercase animate-glowPulse"
      style={{
        fontSize: 13,
        letterSpacing: 5,
        color: 'var(--ink)',
        background: 'linear-gradient(135deg, #f4ebd8 0%, #e5c68a 50%, #d4af37 100%)',
        border: '1px solid rgba(212,175,55,0.6)',
        borderRadius: 999,
        cursor: 'pointer',
      }}
    >
      <span aria-hidden="true">↵</span>
      <span>{label}</span>
    </motion.button>
  );
}
