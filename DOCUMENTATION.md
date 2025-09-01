# PDF to JPG Converter

A Next.js application that converts the first page of PDF files to high-quality JPG images directly in your browser.

## Features

- ✅ Client-side PDF to JPG conversion using PDF.js
- ✅ Drag & drop file upload interface
- ✅ Batch processing of multiple PDFs
- ✅ Configurable image quality settings (DPI, Quality, Scale Factor)
- ✅ Individual file downloads
- ✅ Bulk download as ZIP archive
- ✅ Responsive design with modern dark UI
- ✅ TypeScript support
- ✅ Privacy-focused (all processing happens locally)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload PDFs**: Drag and drop PDF files onto the upload area or click to browse
2. **Adjust Settings**: Configure DPI (72-600), JPEG Quality (1-100%), and Scale Factor (0.1-2.0)
3. **Convert**: Click "Convert to JPG" to process all uploaded files
4. **Download**: Download individual images or all as a ZIP file

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **PDF Processing**: PDF.js 3.11.174
- **File Handling**: file-saver, JSZip
- **Styling**: CSS-in-JS with styled-jsx

## Project Structure

```
pdf-to-jpg-converter/
├── pages/
│   ├── _app.tsx          # App configuration and global styles
│   └── index.tsx         # Main converter component
├── public/
│   └── favicon.ico       # Site favicon
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

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

### Conversion Settings

- **DPI (Resolution)**: 72-600 DPI (default: 200)
- **JPEG Quality**: 1-100% (default: 95%)
- **Scale Factor**: 0.1-2.0 (default: 0.6)

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
