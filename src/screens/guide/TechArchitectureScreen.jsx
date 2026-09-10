import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import archData from '@/data/tech-architecture.json';
import { Search, ChevronDown, ChevronRight, BookOpen, Layers, Plug, Clock, Code, AlertCircle, Server } from 'lucide-react';

const iconMap = {
  Layers: Layers,
  Plug: Plug,
  Clock: Clock,
  Code: Code,
  Server: Server
};

const TechArchitectureScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(archData.categories[0].id);
  const [expandedTopics, setExpandedTopics] = useState({});

  const toggleTopic = (categoryId, topicIndex) => {
    const key = `${categoryId}-${topicIndex}`;
    setExpandedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter logic for the wiki search
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return archData.categories;
    
    const lowerSearch = searchTerm.toLowerCase();
    
    return archData.categories.map(category => {
      const filteredTopics = category.topics.filter(topic => 
        topic.title.toLowerCase().includes(lowerSearch) || 
        topic.content.toLowerCase().includes(lowerSearch) ||
        topic.resolution.toLowerCase().includes(lowerSearch)
      );
      
      if (filteredTopics.length > 0 || category.title.toLowerCase().includes(lowerSearch)) {
        return { ...category, topics: filteredTopics.length > 0 ? filteredTopics : category.topics };
      }
      return null;
    }).filter(Boolean);
  }, [searchTerm]);

  // Expand all results if searching
  React.useEffect(() => {
    if (searchTerm) {
      const newExpanded = {};
      filteredCategories.forEach(cat => {
        cat.topics.forEach((_, idx) => {
          newExpanded[`${cat.id}-${idx}`] = true;
        });
      });
      setExpandedTopics(newExpanded);
      if (filteredCategories.length > 0) {
        setActiveCategory(filteredCategories[0].id);
      }
    } else {
      setExpandedTopics({});
    }
  }, [searchTerm, filteredCategories]);

  const displayCategories = searchTerm ? filteredCategories : archData.categories;
  const currentCategoryData = displayCategories.find(c => c.id === activeCategory) || displayCategories[0];

  return (
    <DashboardLayout title="Tech Architecture Guide">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
        
        {/* Left Sidebar: Tabs */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-fg/40" />
            <input
              type="text"
              placeholder="Search architecture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:border-primary outline-none transition-colors shadow-sm"
            />
          </div>

          <div className="bg-card border border-border rounded-xl p-3 shadow-sm flex-1 overflow-y-auto">
            <div className="text-xs font-bold text-fg/40 uppercase tracking-wider mb-3 px-3">Categories</div>
            <div className="space-y-1">
              {displayCategories.length === 0 ? (
                <div className="px-3 py-4 text-sm text-fg/60">No results found for "{searchTerm}"</div>
              ) : (
                displayCategories.map(category => {
                  const IconComponent = iconMap[category.icon] || BookOpen;
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-fg/70 hover:bg-bg/50 hover:text-fg'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-fg/50'}`} />
                      <span className="text-left line-clamp-1">{category.title}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Content Area: Accordion FAQ */}
        <div className="w-full lg:w-3/4 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          {currentCategoryData ? (
            <>
              <div className="p-6 border-b border-border bg-bg/20 flex items-center gap-4">
                {(() => {
                  const HeaderIcon = iconMap[currentCategoryData.icon] || BookOpen;
                  return (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <HeaderIcon className="w-6 h-6" />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-xl font-bold text-fg">{currentCategoryData.title}</h2>
                  <p className="text-sm text-fg/60 mt-1">Technical stack and architectural decisions.</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {currentCategoryData.topics.map((topic, index) => {
                  const isExpanded = expandedTopics[`${currentCategoryData.id}-${index}`];
                  return (
                    <div 
                      key={index} 
                      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                        isExpanded ? 'border-primary/30 shadow-sm' : 'border-border hover:border-fg/20'
                      }`}
                    >
                      <button
                        onClick={() => toggleTopic(currentCategoryData.id, index)}
                        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                          isExpanded ? 'bg-primary/5' : 'bg-card hover:bg-bg/30'
                        }`}
                      >
                        <span className="font-bold text-fg pr-4">{topic.title}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-primary shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-fg/40 shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-5 border-t border-border/50 bg-card">
                          <p className="text-sm text-fg/80 leading-relaxed mb-4">
                            {topic.content}
                          </p>
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-bold text-primary mb-1">Developer Guidelines</div>
                              <p className="text-sm text-fg/80 leading-relaxed">
                                {topic.resolution}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-fg/40">
              <BookOpen className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a category or adjust your search.</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default TechArchitectureScreen;
