"use client";

import { CTASection } from "@/app/(shared)/components/cta";
import { TableOfContents } from "@/app/(shared)/components/toc";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Search } from "./search";
import { Sidebar } from "./sidebar";

interface DocsLayoutProps {
  children: React.ReactNode;
  sections: any[]; // Ajuste o tipo conforme necessário
}
export function DocsLayout({ children, sections }: DocsLayoutProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <motion.div
          className="col-span-3 relative "
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Sidebar sections={sections} />
        </motion.div>

        <motion.main
          key={pathname}
          className="col-span-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Search sections={sections} className="mb-8" />
          <div className="markdown-content">{children}</div>
          <CTASection />
        </motion.main>

        <motion.div
          key={pathname}
          className="col-span-3 pb-20 hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TableOfContents />
        </motion.div>
      </div>
    </motion.div>
  );
}
