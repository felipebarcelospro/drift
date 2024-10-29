"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { config } from "@/configs/application";
import { ContentMetadata, ContentSection, ContentType } from "@/lib/docs";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Clock, Rss, Triangle } from "lucide-react";
import { MouseEvent as ReactMouseEvent, useState } from "react";
import { CanvasRevealEffect } from "./canvas-reveal-effect";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

interface CategoryButtonProps {
  category: string;
  isActive: boolean;
  onClick: () => void;
}

function CategoryButton({ category, isActive, onClick }: CategoryButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-3 py-1 rounded-full text-sm ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={onClick}
    >
      {category}
    </motion.button>
  );
}

interface BlogPostCardProps {
  post: ContentMetadata;
}

function BlogPostCard({ post }: BlogPostCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const getIcon = (type: ContentType) => {
    switch (type) {
      case "blog":
        return <Triangle className="h-8 w-8 text-foreground" />;
      case "docs":
        return <Clock className="h-8 w-8 text-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("default", { month: "short", day: "numeric" });
  };

  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.div
        variants={itemVariants}
        className="group/spotlight relative p-4 rounded-md border border-border bg-background h-full"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="pointer-events-none absolute z-0 -inset-px rounded-md opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
          style={{
            backgroundColor: "hsl(var(--muted))",
            maskImage: useMotionTemplate`
              radial-gradient(
                350px circle at ${mouseX}px ${mouseY}px,
                white,
                transparent 80%
              )
            `,
          }}
        >
          {isHovering && (
            <CanvasRevealEffect
              animationSpeed={5}
              containerClassName="bg-transparent absolute inset-0 pointer-events-none"
              colors={[
                [59, 130, 246],
                [139, 92, 246],
              ]}
              dotSize={3}
            />
          )}
        </motion.div>

        <Card className="relative bg-transparent border-none overflow-hidden h-full flex flex-col">
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex justify-between items-start">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {getIcon(post.type)}
              </motion.div>
              <span className="text-sm text-muted-foreground">
                {formatDate(post.date)}
              </span>
            </div>

            <div className="flex-grow mt-20 flex flex-col justify-end">
              <h2 className="text-xl leading-8 font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {post.description}
              </p>
            </div>

            <div className="flex items-center space-x-2 mt-auto pt-4 border-t border-border">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={config.developerImage}
                alt={config.developerName}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-muted-foreground">
                {config.developerName}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

interface BlogNavbarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function BlogNavbar({
  activeCategory,
  onCategoryChange,
  categories,
  searchQuery,
  onSearchChange,
}: BlogNavbarProps) {
  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex items-center justify-between py-4 border-b border-border"
    >
      <motion.div className="flex space-x-4" variants={containerVariants}>
        {categories.map((category) => (
          <motion.div key={category} variants={itemVariants}>
            <CategoryButton
              category={category}
              isActive={activeCategory === category}
              onClick={() => onCategoryChange(category)}
            />
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="flex items-center space-x-4"
        variants={itemVariants}
      >
        <Input
          type="search"
          placeholder="Search posts"
          className="w-64"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
          <Rss className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </motion.nav>
  );
}

export function BlogList({ posts }: { posts: ContentSection[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All Posts");
  const [searchQuery, setSearchQuery] = useState("");

  const allPosts = posts.flatMap((section) => section.items);

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "All Posts" ||
      post.category === activeCategory.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getCategories = () => {
    return ["All Posts", ...new Set(posts.map((section) => section.title))];
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full text-foreground"
    >
      <BlogNavbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categories={getCategories()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <motion.main className="pt-6" variants={containerVariants}>
        <ScrollArea className="min-h-[calc(100vh-100px)]">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {filteredPosts.map((post, index) => (
              <BlogPostCard key={`${post.slug}-${index}`} post={post} />
            ))}
          </motion.div>
        </ScrollArea>
      </motion.main>
    </motion.div>
  );
}
