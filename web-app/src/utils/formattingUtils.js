/**
 * Utility functions for text formatting in the editor
 */

// Insert formatting template
export const getFormattingTemplate = (formatType) => {
  let template = "";
  let selectionStart = 0;
  let selectionEnd = 0;
  
  // Define templates for different formatting types
  switch (formatType) {
    case 'bold':
      template = "**Bold Text**";
      selectionStart = 2;
      selectionEnd = 11;
      break;
    case 'italic':
      template = "*Italic Text*";
      selectionStart = 1;
      selectionEnd = 12;
      break;
    case 'heading1':
      template = "# Heading 1";
      selectionStart = 2;
      selectionEnd = 10;
      break;
    case 'heading2':
      template = "## Heading 2";
      selectionStart = 3;
      selectionEnd = 11;
      break;
    case 'heading3':
      template = "### Heading 3";
      selectionStart = 4;
      selectionEnd = 12;
      break;
    case 'bulletList':
      template = "\n- Item 1\n- Item 2\n- Item 3";
      selectionStart = 3;
      selectionEnd = 9;
      break;
    case 'numberedList':
      template = "\n1. Item 1\n2. Item 2\n3. Item 3";
      selectionStart = 4;
      selectionEnd = 10;
      break;
    case 'quote':
      template = "> Blockquote text";
      selectionStart = 2;
      selectionEnd = 15;
      break;
    case 'code':
      template = "```\ncode block\n```";
      selectionStart = 4;
      selectionEnd = 13;
      break;
    case 'inlineCode':
      template = "`inline code`";
      selectionStart = 1;
      selectionEnd = 12;
      break;
    case 'link':
      template = "[Link text](https://example.com)";
      selectionStart = 1;
      selectionEnd = 10;
      break;
    case 'image':
      template = "![Image alt text](https://example.com/image.jpg)";
      selectionStart = 2;
      selectionEnd = 15;
      break;
    case 'table':
      template = "\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |\n| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |";
      break;
    case 'horizontalRule':
      template = "\n---\n";
      break;
    case 'inlineLatex':
      template = "$x^2 + y^2 = z^2$";
      selectionStart = 1;
      selectionEnd = 13;
      break;
    case 'blockLatex':
      template = "$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$";
      selectionStart = 2;
      selectionEnd = 30;
      break;
    case 'strikethrough':
      template = "~~Strikethrough text~~";
      selectionStart = 2;
      selectionEnd = 20;
      break;
    case 'highlight':
      template = "==Highlighted text==";
      selectionStart = 2;
      selectionEnd = 18;
      break;
    case 'subscript':
      template = "H~2~O";
      selectionStart = 1;
      selectionEnd = 4;
      break;
    case 'superscript':
      template = "E=mc^2^";
      selectionStart = 4;
      selectionEnd = 7;
      break;
    default:
      template = "";
  }
  
  return { template, selectionStart, selectionEnd };
};
