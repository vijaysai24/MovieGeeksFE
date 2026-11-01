import { motion, useReducedMotion } from "framer-motion";

// Entrance for the parts of a page section: each part rises a little and fades in once, staggered
// by its index. Reduced motion keeps the content and drops the travel. App screens do not use it.
export function Reveal({ as = "div", index = 0, className = "", children, ...props }) {
  const reduce = useReducedMotion();
  const Component = motion[as] || motion.div;

  if (reduce) {
    const Plain = as;
    return <Plain className={className} {...props}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: index * 0.075, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Component>
  );
}
