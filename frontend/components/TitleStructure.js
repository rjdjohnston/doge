import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

function StructureNode({ node, depth = 0, titleNumber, parentPath = [], currentPath = [], agencySlug = null }) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  
  // Check if this node is in the current path
  const isCurrentPath = currentPath.includes(node.identifier);
  
  // Auto-expand if this node is in the current path
  useEffect(() => {
    if (isCurrentPath) {
      setIsExpanded(true);
    }
  }, [isCurrentPath]);

  const handleExpand = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleNavigate = (e) => {
    e.stopPropagation();

    // Determine node type from the node's properties and label
    let nodeType;
    if (node.label?.toLowerCase().includes('chapter')) {
      nodeType = 'chapter';
    } else if (node.identifier?.match(/^\d+$/) && parentPath.length > 0) {
      // Only treat as part if it's not a top-level node
      nodeType = 'part';
    }

    // Build the route based on node type
    let route = {
      pathname: `/titles/${titleNumber}`,
      query: {}
    };

    if (nodeType === 'chapter') {
      route.pathname += `/chapters/${node.identifier}`;
    } else if (nodeType === 'part') {
      route.pathname += `/parts/${node.identifier}`;
    }

    // Add agency context if available
    if (agencySlug) {
      route.query.from = 'agency';
      route.query.agency = agencySlug;
    }

    console.log('Navigating to:', route);
    router.push(route);
  };

  return (
    <div className={`ml-${depth * 2}`}>
      <div className={`flex items-center gap-1 ${isCurrentPath ? 'bg-blue-50' : ''}`}>
        {hasChildren ? (
          <button
            onClick={handleExpand}
            className="p-1.5 hover:bg-gray-100 rounded"
          >
            <span className="w-4 h-4 flex-shrink-0">
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </span>
          </button>
        ) : (
          // Spacer for alignment
          <span className="w-7"></span>
        )}
        
        <button
          onClick={handleNavigate}
          className="flex-grow py-1.5 px-1 text-left hover:text-blue-600 rounded-sm hover:bg-gray-50"
        >
          <span className="text-sm">{node.label || node.identifier}</span>
          {node.subject && (
            <p className="text-xs text-gray-600 mt-0.5">{node.subject}</p>
          )}
        </button>
      </div>

      {isExpanded && hasChildren && (
        <div className="border-l border-gray-200 ml-2.5 pl-2">
          {node.children.map((child, index) => (
            <StructureNode 
              key={`${child.identifier}-${index}`}
              node={child}
              depth={depth + 1}
              titleNumber={titleNumber}
              parentPath={[...parentPath, node.identifier]}
              currentPath={currentPath}
              agencySlug={agencySlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TitleStructure({ structure, titleNumber, agencySlug }) {
  if (!structure) return null;

  const renderSubtitle = (subtitle) => (
    <div key={subtitle.identifier} className="mb-4">
      <Link 
        href={`/titles/${titleNumber}/subtitles/${subtitle.identifier}`}
        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
      >
        Subtitle {subtitle.identifier}: {subtitle.heading}
      </Link>
      {subtitle.children && subtitle.children.length > 0 && (
        <div className="mt-2">
          {subtitle.children.map((child, index) => (
            <StructureNode
              key={`${child.identifier}-${index}`}
              node={child}
              titleNumber={titleNumber}
              parentPath={[subtitle.identifier]}
              currentPath={[]}
              agencySlug={agencySlug}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white">
      <div className="p-4">
        <StructureNode 
          node={structure} 
          titleNumber={titleNumber}
          agencySlug={agencySlug}
        />
      </div>
    </div>
  );
} 