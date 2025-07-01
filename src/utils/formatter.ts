import prettier from 'prettier/standalone';
import htmlParser from 'prettier/plugins/html';
import cssParser from 'prettier/plugins/postcss';
import jsParser from 'prettier/plugins/babel';
import tsParser from 'prettier/plugins/typescript';
import estree from 'prettier/plugins/estree';

export const formatCode = async (code: string, language: string): Promise<string> => {
  try {
    const options: any = {
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      quoteProps: 'as-needed',
      trailingComma: 'es5',
    };

    switch (language) {
      case 'html':
        return await prettier.format(code, {
          ...options,
          parser: 'html',
          plugins: [htmlParser],
        });
      
      case 'css':
        return await prettier.format(code, {
          ...options,
          parser: 'css',
          plugins: [cssParser],
        });
      
      case 'javascript':
        return await prettier.format(code, {
          ...options,
          parser: 'babel',
          plugins: [jsParser, estree],
        });
      
      case 'typescript':
        return await prettier.format(code, {
          ...options,
          parser: 'typescript',
          plugins: [tsParser, estree],
        });
      
      case 'json':
        return JSON.stringify(JSON.parse(code), null, 2);
      
      default:
        return code;
    }
  } catch (error) {
    console.error('Formatting error:', error);
    return code;
  }
};

export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    default:
      return 'plaintext';
  }
};