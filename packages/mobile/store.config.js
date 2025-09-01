// Store listing configuration for app stores
module.exports = {
  // App Store Connect (iOS)
  ios: {
    appName: "PDF Tools",
    subtitle: "Professional PDF Processing",
    description: `PDF Tools is the ultimate mobile app for all your PDF processing needs. Whether you need to merge multiple documents, split large files, or compress PDFs to save space, our app provides fast, secure, and reliable solutions right on your mobile device.

Key Features:
• Merge multiple PDF files into one document
• Split PDFs by page range or extract individual pages
• Compress large PDFs while maintaining quality
• Process files offline - no internet required
• Secure processing - files never leave your device
• Cross-platform sync with your web account
• Support for large files and batch operations
• Intuitive interface designed for mobile

Perfect for students, professionals, and anyone who works with PDF documents regularly. Download PDF Tools today and take control of your document workflow!`,
    keywords: [
      "PDF",
      "merge",
      "split",
      "compress",
      "document",
      "productivity",
      "business",
      "office",
      "tools",
      "converter"
    ],
    supportURL: "https://www.pdftools.com/support",
    marketingURL: "https://www.pdftools.com",
    privacyPolicyURL: "https://www.pdftools.com/privacy",
    category: "PRODUCTIVITY",
    contentRating: "4+",
    screenshots: {
      // iPhone screenshots (6.5" display)
      iphone65: [
        "./screenshots/ios/iphone-6.5/01-home.png",
        "./screenshots/ios/iphone-6.5/02-merge.png",
        "./screenshots/ios/iphone-6.5/03-split.png",
        "./screenshots/ios/iphone-6.5/04-compress.png",
        "./screenshots/ios/iphone-6.5/05-history.png"
      ],
      // iPhone screenshots (6.1" display)
      iphone61: [
        "./screenshots/ios/iphone-6.1/01-home.png",
        "./screenshots/ios/iphone-6.1/02-merge.png",
        "./screenshots/ios/iphone-6.1/03-split.png",
        "./screenshots/ios/iphone-6.1/04-compress.png",
        "./screenshots/ios/iphone-6.1/05-history.png"
      ],
      // iPad screenshots
      ipad: [
        "./screenshots/ios/ipad/01-home.png",
        "./screenshots/ios/ipad/02-merge.png",
        "./screenshots/ios/ipad/03-split.png"
      ]
    }
  },

  // Google Play Store (Android)
  android: {
    title: "PDF Tools - Merge, Split & Compress",
    shortDescription: "Professional PDF processing tools for your mobile device",
    fullDescription: `Transform your mobile device into a powerful PDF processing station with PDF Tools. Our comprehensive app provides all the essential tools you need to work with PDF documents efficiently and securely.

🔧 POWERFUL FEATURES
• Merge multiple PDF files into a single document
• Split large PDFs by page range or extract individual pages
• Compress PDFs to reduce file size without quality loss
• Batch processing for multiple files
• Offline processing - no internet connection required
• Cross-platform account sync

🔒 SECURITY & PRIVACY
• All processing happens locally on your device
• Files are never uploaded to external servers
• Secure file handling and automatic cleanup
• Privacy-focused design with optional cloud sync

⚡ PERFORMANCE
• Lightning-fast processing optimized for mobile
• Support for large files and complex documents
• Efficient memory usage and battery optimization
• Smooth user experience with intuitive interface

👥 PERFECT FOR
• Students managing academic documents
• Business professionals handling contracts
• Researchers organizing papers
• Anyone who works with PDF files regularly

📱 CROSS-PLATFORM
• Sync your account across web, iOS, and Android
• Seamless experience across all your devices
• Cloud backup for your processing history

Download PDF Tools today and streamline your document workflow!`,
    category: "PRODUCTIVITY",
    contentRating: "Everyone",
    tags: [
      "PDF",
      "productivity",
      "business",
      "documents",
      "merge",
      "split",
      "compress",
      "office",
      "tools",
      "converter"
    ],
    website: "https://www.pdftools.com",
    email: "support@pdftools.com",
    privacyPolicy: "https://www.pdftools.com/privacy",
    screenshots: {
      phone: [
        "./screenshots/android/phone/01-home.png",
        "./screenshots/android/phone/02-merge.png",
        "./screenshots/android/phone/03-split.png",
        "./screenshots/android/phone/04-compress.png",
        "./screenshots/android/phone/05-history.png",
        "./screenshots/android/phone/06-profile.png"
      ],
      tablet: [
        "./screenshots/android/tablet/01-home.png",
        "./screenshots/android/tablet/02-merge.png",
        "./screenshots/android/tablet/03-tools.png"
      ]
    },
    featureGraphic: "./screenshots/android/feature-graphic.png",
    icon: "./screenshots/android/icon-512.png"
  },

  // Release notes template
  releaseNotes: {
    "1.0.0": {
      en: `🎉 Welcome to PDF Tools!

New Features:
• Merge multiple PDF files into one
• Split PDFs by page range
• Compress large PDF files
• Offline processing capabilities
• Cross-platform account sync
• Intuitive mobile interface

We're excited to bring professional PDF tools to your mobile device!`
    }
  }
};