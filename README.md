# PDF to JPG Converter

A Next.js application that converts the first page of PDF files to high-quality JPG images directly in your browser.

## Features

- ✅ Client-side PDF to JPG conversion using PDF.js
- ✅ Drag & drop file upload interface
- ✅ Batch processing of multiple PDFs
- ✅ Configurable image quality settings
- ✅ Individual file downloads
- ✅ Bulk download as ZIP archive
- ✅ Responsive design with modern UI
- ✅ TypeScript support
- ✅ Privacy-focused (all processing happens locally)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf-to-jpg-converter
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload PDFs**: Drag and drop PDF files onto the upload area or click to browse
2. **Adjust Quality**: Use the quality slider to set the output image quality (10% - 100%)
3. **Convert**: Files are automatically processed when uploaded
4. **Download**: Download individual images or all as a ZIP file

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **PDF Processing**: PDF.js
- **File Handling**: file-saver, JSZip
- **Styling**: CSS-in-JS with inline styles

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Configuration

The application includes several configuration files:

- `next.config.js`: Next.js configuration with PDF.js worker setup
- `tsconfig.json`: TypeScript configuration
- `package.json`: Dependencies and scripts

## Browser Compatibility

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Privacy & Security

- All PDF processing happens entirely in your browser
- No files are uploaded to any server
- No data is collected or stored
- Works completely offline after initial load

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
