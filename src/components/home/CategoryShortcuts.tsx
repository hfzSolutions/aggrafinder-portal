import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/utils/animations';

// Define the categories with their icons and routes
const categories = [
  { name: 'Chatbots', icon: '💬', route: '/tools?category=Chatbots' },
  {
    name: 'Image Generation',
    icon: '🎨',
    route: '/tools?category=Image+Generation',
  },
  {
    name: 'Video Generation',
    icon: '🎬',
    route: '/tools?category=Video+Generation',
  },
  {
    name: 'Copywriting',
    icon: '✍️',
    route: '/tools?category=Copywriting',
  },
  { name: 'Data Analysis', icon: '📊', route: '/tools?category=Data+Analysis' },
  {
    name: 'Marketing',
    icon: '📢',
    route: '/tools?category=Marketing',
  },
  {
    name: 'Code Generation',
    icon: '💻',
    route: '/tools?category=Code+Generation',
  },
  { name: 'All Categories', icon: '🔍', route: '/tools' },
];

const CategoryShortcuts = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);

  return (
    <section className="w-full py-12 border-t border-border/20 bg-background">
      <div
        // @ts-ignore
        ref={ref}
        className={`container px-4 md:px-8 mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.route}
              className="flex items-center px-4 py-2 bg-card hover:bg-accent rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-border hover:border-primary/20"
            >
              <span className="mr-2 text-xl">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShortcuts;
