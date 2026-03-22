"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// スクロールして画面に入った時に、下からフワッと浮かび上がるコンポーネント
export const ScrollFadeIn = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
};

// 画面が表示された瞬間にフェードインするコンポーネント
export const FadeIn = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
};