"use client";

/**
 * @author: @dorianbaffier
 * @description: Shimmer Text
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Text_01Props {
  text: string;
  className?: string;
}

export default function ShimmerText({
  text = "Text Shimmer",
  className,
}: Text_01Props) {
  // Адаптировано под сайт: без демо-обёртки с p-8 и без <h1> (заголовок
  // страницы уже есть), шрифт и размер задаёт className.
  return (
    <motion.span
      animate={{ backgroundPosition: ["200% center", "-200% center"] }}
      className={cn(
        "inline-block bg-[length:200%_100%] bg-gradient-to-r from-neutral-950 via-neutral-400 to-neutral-950 bg-clip-text text-transparent dark:from-steel dark:via-white dark:to-steel",
        className
      )}
      transition={{ duration: 3.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
    >
      {text}
    </motion.span>
  );
}
