import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Paper, Box } from '@mui/material';

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom renderer for code blocks
        code: ({node, inline, className, children, ...props}) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
            <Paper elevation={0} sx={{ p: 1, bgcolor: 'grey.100', my: 1, borderRadius: 1, overflow: 'auto' }}>
              <pre style={{ margin: 0 }}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </Paper>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // Custom renderer for math expressions
        p: ({node, children, ...props}) => {
          const childrenArray = React.Children.toArray(children);
          const processedChildren = childrenArray.map((child, index) => {
            if (typeof child === 'string') {
              // Process inline LaTeX: $...$
              const inlineLatexRegex = /\$(.*?)\$/g;
              const parts = [];
              let lastIndex = 0;
              let match;
              
              while ((match = inlineLatexRegex.exec(child)) !== null) {
                // Add text before the match
                if (match.index > lastIndex) {
                  parts.push(child.substring(lastIndex, match.index));
                }
                
                // Add the LaTeX component
                try {
                  parts.push(<InlineMath key={`inline-${index}-${match.index}`} math={match[1]} />);
                } catch (error) {
                  console.error("Error rendering inline LaTeX:", error);
                  parts.push(`$${match[1]}$`);
                }
                
                lastIndex = match.index + match[0].length;
              }
              
              // Add remaining text
              if (lastIndex < child.length) {
                parts.push(child.substring(lastIndex));
              }
              
              return parts.length > 0 ? parts : child;
            }
            
            // Process block LaTeX: $$...$$
            if (typeof child === 'string' && child.startsWith('$$') && child.endsWith('$$')) {
              const latex = child.substring(2, child.length - 2);
              try {
                return <BlockMath key={`block-${index}`} math={latex} />;
              } catch (error) {
                console.error("Error rendering block LaTeX:", error);
                return child;
              }
            }
            
            return child;
          });
          
          return <p {...props}>{processedChildren}</p>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
