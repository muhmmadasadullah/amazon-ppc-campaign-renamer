# Amazon PPC Campaign Renamer

A sophisticated browser-based web application designed for Amazon advertisers to bulk-rename campaigns in their Amazon Ads bulk operations files. The tool runs entirely client-side with no backend requirements, leveraging modern web technologies for high performance and security.

## 🌟 Key Features

### 🚀 **High Performance Processing**
- **Web Worker Architecture**: Excel parsing handled in background threads to keep UI responsive
- **Memory Optimized**: Handles large files (up to 120MB) with efficient memory management
- **Virtualized Rendering**: Smooth performance with thousands of campaigns using react-window
- **Streaming Processing**: Processes data in chunks to prevent browser freezing

### 🧠 **Intelligent Campaign Detection**
- **Campaign Type Classification**: Automatically detects SP, SB, SD, and SBV campaigns
- **Match Type Recognition**: Identifies Exact, Phrase, Broad, Auto, and Product Targeting
- **Special Campaign Detection**:
  - **SKC (Single Keyword Campaigns)**: Identifies campaigns with exactly one keyword
  - **Brand Defense**: Detects campaigns targeting own brand terms or ASINs
  - **Placement Modifiers**: Recognizes Top of Search and Product Pages bid adjustments

### 📊 **Rich Analytics & Insights**
- **Interactive Dashboard**: Real-time statistics with interactive pie charts
- **Advanced Filtering**: Filter by campaign type, match type, badges, and advertised ASINs
- **Smart Search**: Search across campaign names, ASINs, and attributes
- **Validation Insights**: Real-time duplicate detection and length validation

### 🎯 **Automated Naming Logic**
- **Template-Based Naming**: Uses standardized naming conventions per Amazon best practices
- **Product Name Integration**: Supports custom product naming templates via Excel upload
- **Brand Detection**: Automatically tags defensive campaigns based on brand tokens
- **Duplicate Resolution**: Automatically resolves naming conflicts with versioning
- **Length Compliance**: Enforces Amazon's character limits (128 for Sellers, 116 for Vendors)

### 🔧 **User Experience**
- **Drag & Drop Upload**: Intuitive file upload with validation
- **Inline Editing**: Click-to-edit campaign names with real-time validation
- **Dark/Light Themes**: Automatic theme detection with manual toggle
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Progress Tracking**: Clear step-by-step workflow with progress indicators

### 📁 **File Format Support**
- **Excel Files**: .xlsx and .xls formats with multi-sheet support
- **CSV Support**: Handles CSV exports from Amazon Ads
- **Template Files**: Excel-based product naming templates
- **Export Compliance**: Generates Amazon-compliant bulk operation files

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **React 18**: Modern functional components with hooks
- **Vite**: Lightning-fast development and optimized builds
- **Tailwind CSS**: Utility-first styling for rapid development
- **DaisyUI**: Elegant component library with built-in theming

### **Data Processing**
- **SheetJS (XLSX)**: Industry-standard Excel parsing with memory optimization
- **Web Workers**: Background processing for non-blocking file operations
- **Chart.js**: Interactive data visualizations
- **React-Window**: Virtual scrolling for large datasets

### **Performance Optimizations**
- **Memory Management**: Efficient data structures and garbage collection
- **Streaming**: Large file processing in manageable chunks
- **Lazy Loading**: Components loaded on demand
- **Bundle Optimization**: Tree shaking and code splitting

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd amazon-ppc-campaign-renamer

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Usage Workflow**

#### **Step 1: Upload Bulk File**
1. Download your bulk operations file from Amazon Ads console
2. Drag and drop the file into the upload area (or click to select)
3. Wait for parsing to complete (progress indicator shows status)

#### **Step 2: Configure Settings**
- **Platform Type**: Select Seller (128 chars) or Vendor (116 chars)
- **Brand Tokens**: Enter your brand names (comma-separated) for defense detection
- **Product Template**: Optionally upload Excel file with ASIN → Product Name mappings

#### **Step 3: Review & Filter**
- Use the dashboard to understand your campaign composition
- Apply filters to focus on specific campaign types or attributes  
- Use the search function to locate specific campaigns

#### **Step 4: Generate Names**
- Click "Generate Names" to apply automated naming logic
- Review generated names in the table
- Edit individual names by clicking on them (inline editing)
- Check the status column for any validation issues

#### **Step 5: Export**
- Review export statistics and resolve any issues
- Click "Download Updated File" to get the renamed bulk file
- Upload the file to Amazon Ads console to apply changes

## 📝 **Naming Convention Logic**

The tool generates campaign names following this structure:
```
[Type] - [Targeting] - [Product] - [Modifiers]
```

### **Examples:**
- `SP - EX - PreWorkout - TOS` (Sponsored Products, Exact match, with Top of Search boost)
- `SP - AUTO - TongkatAli` (Sponsored Products Auto campaign)
- `SB-PC - KW-PH - BrandName - DEF` (Sponsored Brands Phrase match, Brand Defense)
- `SD - RT - ProductName` (Sponsored Display Retargeting)

### **Naming Components:**
- **Type**: SP, SB, SBV, SD
- **Targeting**: EX, PH, BR, AUTO, PAT (Product Targeting)
- **Product**: From template or ASIN fallback
- **Modifiers**: DEF (Defense), TOS (Top of Search), PP (Product Pages)

## 🧪 **Testing**

### **Automated Testing**
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### **Manual Testing Checklist**
- [ ] Upload various file types (.xlsx, .xls, .csv)
- [ ] Test with large files (>50MB)
- [ ] Verify campaign detection accuracy
- [ ] Test naming logic with different campaign types
- [ ] Check filtering and search functionality
- [ ] Validate export file format
- [ ] Test responsive design on different screens
- [ ] Verify dark/light theme switching

### **Performance Testing**
- [ ] Load file with 10,000+ campaigns
- [ ] Monitor memory usage during processing
- [ ] Test table scrolling performance
- [ ] Verify export speed with large datasets

## 🔧 **Configuration**

### **Environment Variables**
```env
# Vite Configuration
VITE_MAX_FILE_SIZE=125829120  # 120MB in bytes
VITE_CHAR_LIMIT_SELLER=128
VITE_CHAR_LIMIT_VENDOR=116
```

### **Browser Requirements**
- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+

### **File Size Limits**
- Maximum upload: 120MB
- Recommended: <50MB for optimal performance
- Memory usage: ~2x file size during processing

## 🛠️ **Development**

### **Project Structure**
```
src/
├── components/          # React components
│   ├── Dashboard.jsx   # Analytics and filtering
│   ├── CampaignTable.jsx  # Virtualized data table
│   ├── FileUpload.jsx  # File handling
│   └── ExportSection.jsx # Export functionality
├── hooks/              # Custom React hooks
│   ├── useCampaignData.js  # Campaign state management
│   ├── useTemplateData.js  # Template processing
│   └── useNameGeneration.js # Naming logic
├── workers/            # Web Workers
│   └── excelParser.js  # Excel processing worker
└── utils/              # Utility functions
    └── mockData.js     # Test data
```

### **Key Files**
- `src/workers/excelParser.js`: Core Excel parsing and campaign detection
- `src/hooks/useNameGeneration.js`: Campaign naming logic and validation
- `src/components/CampaignTable.jsx`: High-performance data table with virtualization
- `src/components/Dashboard.jsx`: Analytics dashboard with Chart.js integration

### **Build Process**
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📈 **Performance Metrics**

### **File Processing**
- 10MB file: ~2-5 seconds
- 50MB file: ~8-15 seconds  
- 120MB file: ~20-30 seconds

### **Memory Usage**
- Base application: ~15MB
- 50MB file processing: ~100-150MB peak
- Table with 10k campaigns: ~50-75MB

### **UI Performance**
- Table rendering: 16ms per frame (60 FPS)
- Search response: <100ms
- Filter application: <50ms

## 🔒 **Security & Privacy**

- **Client-Side Only**: No data ever leaves your browser
- **No Backend**: Zero server-side processing or storage  
- **Local Processing**: All file parsing happens in your browser
- **Memory Cleanup**: Automatic cleanup after processing
- **No Tracking**: No analytics or user tracking

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit with conventional commits: `git commit -m "feat: add new feature"`
6. Push and create a Pull Request

### **Code Standards**
- ESLint configuration for code quality
- Prettier for code formatting
- Conventional commits for change tracking
- React best practices and hooks patterns

## 📊 **Roadmap**

### **Phase 1: Core Features** ✅
- [x] Excel file parsing and campaign detection
- [x] Automated naming logic implementation
- [x] Interactive dashboard and filtering
- [x] Export functionality

### **Phase 2: Advanced Features** 🚧
- [ ] Ad Group renaming logic
- [ ] Portfolio-level naming conventions
- [ ] Advanced placement modifier detection
- [ ] Bulk find/replace operations

### **Phase 3: Enterprise Features** 📋
- [ ] Multi-account template management
- [ ] Custom naming rule builder
- [ ] API integration for direct Amazon Ads updates
- [ ] Collaboration features for team workflows

## 📞 **Support**

For questions, issues, or feature requests:
- GitHub Issues: Use the issue tracker for bugs and features
- Documentation: Check this README and inline code comments
- Testing: Use the provided mock data for testing functionality

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for Amazon PPC professionals seeking efficiency and accuracy in campaign management.**