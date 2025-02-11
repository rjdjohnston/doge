import { useState } from 'react';
import { ChevronDown as ChevronDownIcon, ChevronRight as ChevronRightIcon } from '@heroicons/react/24/solid';

// Reusable expandable section component
const ExpandableSection = ({ title, wordCount, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg mb-2">
      <button
        className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 mr-2" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 mr-2" />
          )}
          <span className="font-medium">{title}</span>
          {wordCount && (
            <span className="ml-2 text-sm text-gray-600">
              ({wordCount.toLocaleString()} words)
            </span>
          )}
        </div>
      </button>
      {isExpanded && <div className="p-3 border-t">{children}</div>}
    </div>
  );
};

export function TitleDetails({ title, onBack }) {
  const [selectedVersion, setSelectedVersion] = useState(title.versions[0]?.date);

  const renderContent = (content, depth = 0) => {
    if (!content) return null;

    return Object.entries(content).map(([key, value]) => {
      const wordCount = title.wordCounts?.[key] || 0;
      
      if (typeof value === 'object' && value !== null) {
        return (
          <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
            <ExpandableSection title={key} wordCount={wordCount}>
              {renderContent(value, depth + 1)}
            </ExpandableSection>
          </div>
        );
      }

      return (
        <div
          key={key}
          className="p-2 hover:bg-gray-50 rounded"
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <span className="font-medium">{key}:</span>
          <span className="ml-2">{value}</span>
          {wordCount > 0 && (
            <span className="text-sm text-gray-600 ml-2">
              ({wordCount.toLocaleString()} words)
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Titles
        </button>
        
        <div className="flex items-center">
          <span className="mr-2">Version:</span>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="border rounded p-1"
          >
            {title.versions.map((version) => (
              <option key={version.date} value={version.date}>
                {new Date(version.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Title Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Title {title.number}: {title.name}
        </h1>
        <div className="text-sm text-gray-600">
          <div>Total Word Count: {title.wordCounts?.total?.toLocaleString()}</div>
          <div>Corrections: {title.corrections?.length || 0}</div>
        </div>
      </div>

      {/* Ancestors */}
      {title.ancestors?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Ancestors</h2>
          <div className="flex items-center gap-2">
            {title.ancestors.map((ancestor, index) => (
              <div key={ancestor.id} className="flex items-center">
                {index > 0 && <span className="mx-2">→</span>}
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => {/* Handle ancestor navigation */}}
                >
                  {ancestor.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hierarchical Content */}
      <div className="space-y-4">
        {/* Subtitles */}
        {title.structure?.subtitles && (
          <ExpandableSection 
            title="Subtitles" 
            wordCount={Object.values(title.wordCounts?.subtitles || {}).reduce((a, b) => a + b, 0)}
          >
            {renderContent(title.structure.subtitles)}
          </ExpandableSection>
        )}

        {/* Chapters */}
        {title.structure?.chapters && (
          <ExpandableSection 
            title="Chapters"
            wordCount={Object.values(title.wordCounts?.chapters || {}).reduce((a, b) => a + b, 0)}
          >
            {renderContent(title.structure.chapters)}
          </ExpandableSection>
        )}

        {/* Sections */}
        {title.structure?.sections && (
          <ExpandableSection 
            title="Sections"
            wordCount={Object.values(title.wordCounts?.sections || {}).reduce((a, b) => a + b, 0)}
          >
            {renderContent(title.structure.sections)}
          </ExpandableSection>
        )}

        {/* Appendices */}
        {title.structure?.appendices && (
          <ExpandableSection 
            title="Appendices"
            wordCount={title.wordCounts?.appendices}
          >
            {renderContent(title.structure.appendices)}
          </ExpandableSection>
        )}
      </div>
    </div>
  );
} 