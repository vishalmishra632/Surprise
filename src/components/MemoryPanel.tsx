import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type MemoryPanelProps = {
  eyebrow?: string;
  title?: string;
  scriptTitle?: string;
  body?: string;
  closing?: string;
  align?: 'left' | 'center' | 'right';
  children?: ReactNode;
  className?: string;
};

/**
 * Title block used inside scenes — eyebrow (mono), display title (Playfair italic),
 * optional script overlay, body paragraph, closing line.
 */
export default function MemoryPanel({
  eyebrow,
  title,
  scriptTitle,
  body,
  closing,
  align = 'left',
  children,
  className = '',
}: MemoryPanelProps) {
  const alignClass =
    align === 'center'
      ? 'text-center mx-auto'
      : align === 'right'
        ? 'text-right ml-auto'
        : 'text-left';

  return (
    <motion.div
      className={`relative max-w-2xl ${alignClass} ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
      }}
    >
      {eyebrow ? (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono uppercase mb-4 inline-flex items-center gap-3"
          style={{
            fontSize: 11,
            letterSpacing: 5,
            color: 'rgba(244,235,216,0.62)',
          }}
        >
          <span style={{ width: 28, height: 1, background: 'var(--gold)' }} />
          <span>{eyebrow}</span>
        </motion.div>
      ) : null}

      {title ? (
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-gradient-gold font-display"
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 5.4rem)',
            lineHeight: 1.0,
            fontStyle: 'italic',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </motion.h2>
      ) : null}

      {scriptTitle ? (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-gradient-rose font-display italic mt-2"
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
          }}
        >
          {scriptTitle}
        </motion.div>
      ) : null}

      {body ? (
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display italic mt-6"
          style={{
            fontSize: 'clamp(1.05rem, 1.7vw, 1.35rem)',
            lineHeight: 1.55,
            color: 'rgba(244,235,216,0.78)',
            maxWidth: '38ch',
          }}
        >
          {body}
        </motion.p>
      ) : null}

      {children}

      {closing ? (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 font-mono uppercase"
          style={{
            fontSize: 11,
            letterSpacing: 4,
            color: 'var(--champagne)',
          }}
        >
          {closing}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
